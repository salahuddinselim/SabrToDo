const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

function loadEnv(filePath) {
  const env = {};
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    const value = rest.join('=').trim();
    env[key] = value.replace(/^"|"$/g, '');
  }
  return env;
}

const envPath = path.resolve(__dirname, '../.env.local');
const env = loadEnv(envPath);

const SPREADSHEET_ID = env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_EMAIL = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!SPREADSHEET_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
  console.error('Missing required env vars: GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY');
  process.exit(1);
}

const HEADERS = {
  users: ['id', 'firebase_uid', 'email', 'display_name', 'created_at', 'updated_at'],
  tasks: [
    'id', 'user_id', 'user_email', 'title', 'description', 'due_date',
    'priority', 'status', 'notify_before', 'created_at', 'completed_at', 'order_index',
  ],
  notifications: [
    'id', 'user_id', 'user_email', 'type', 'title', 'message', 'task_id', 'is_read', 'created_at',
  ],
  push_subscriptions: [
    'id', 'user_id', 'user_email', 'endpoint', 'subscription', 'created_at',
  ],
  settings: [
    'id', 'user_id', 'user_email', 'daily_goal', 'selected_theme', 'notif_states', 'sec_states', 'updated_at',
  ],
};

function normalizeEmail(email) {
  return (email ?? '').trim().toLowerCase();
}

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: SERVICE_ACCOUNT_EMAIL,
      private_key: PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth }).spreadsheets;
}

async function getAllRows(sheetName) {
  const client = await getClient();
  const result = await client.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
  });

  const rows = result.data.values || [];
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? '';
    });
    return record;
  });
}

async function updateRowByColumn(sheetName, columnName, matchValue, data) {
  const client = await getClient();
  const result = await client.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
  });

  const rows = result.data.values || [];
  if (rows.length < 2) return;

  const headers = rows[0];
  const colIndex = headers.indexOf(columnName);
  if (colIndex === -1) return;

  const rowIndex = rows.findIndex((row, i) => i > 0 && row[colIndex] === matchValue);
  if (rowIndex === -1) return;

  const newValues = headers.map((h) => data[h] ?? rows[rowIndex][headers.indexOf(h)] ?? '');
  await client.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A${rowIndex + 1}`,
    valueInputOption: 'RAW',
    requestBody: { values: [newValues] },
  });
}

async function deleteRowByColumn(sheetName, columnName, matchValue) {
  const client = await getClient();
  const result = await client.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
  });

  const rows = result.data.values || [];
  if (rows.length < 2) return;

  const headers = rows[0];
  const colIndex = headers.indexOf(columnName);
  if (colIndex === -1) return;

  const rowIndex = rows.findIndex((row, i) => i > 0 && row[colIndex] === matchValue);
  if (rowIndex === -1) return;

  const metadata = await client.get({
    spreadsheetId: SPREADSHEET_ID,
    ranges: [],
    includeGridData: false,
  });
  const sheet = metadata.data.sheets.find((s) => s.properties.title === sheetName);
  if (!sheet) return;

  await client.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheet.properties.sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });
}

async function updateMultipleRows(sheetName, columnName, updates) {
  for (const update of updates) {
    await updateRowByColumn(sheetName, columnName, update.matchValue, update.data);
  }
}

async function migrateUserIdAcrossSheets(oldUid, newUid, normalizedEmail) {
  const sheetsToMigrate = ['tasks', 'notifications', 'settings', 'push_subscriptions'];
  for (const sheetName of sheetsToMigrate) {
    const rows = await getAllRows(sheetName);
    const updates = rows
      .filter((row) => row.user_id === oldUid)
      .map((row) => ({
        matchValue: row.id,
        data: {
          ...row,
          user_id: newUid,
          user_email: normalizedEmail,
        },
      }));
    await updateMultipleRows(sheetName, 'id', updates);
  }
}

async function repairUserEmails() {
  const users = await getAllRows('users');
  const groups = users.reduce((acc, row) => {
    const email = normalizeEmail(row.email);
    if (!email) return acc;
    if (!acc[email]) acc[email] = [];
    acc[email].push(row);
    return acc;
  }, {});

  let totalMerged = 0;
  let totalDeleted = 0;

  for (const [email, rows] of Object.entries(groups)) {
    if (rows.length < 2) continue;

    const canonical = rows.find((row) => row.firebase_uid) || rows[0];
    const duplicates = rows.filter((row) => row.id !== canonical.id);

    for (const duplicate of duplicates) {
      if (duplicate.firebase_uid && duplicate.firebase_uid !== canonical.firebase_uid) {
        await migrateUserIdAcrossSheets(duplicate.firebase_uid, canonical.firebase_uid || duplicate.firebase_uid, email);
        totalMerged += 1;
      }
      await deleteRowByColumn('users', 'id', duplicate.id);
      totalDeleted += 1;
      console.log(`Deleted duplicate user ${duplicate.id} for email ${email}`);
    }

    if (!canonical.firebase_uid && duplicates.some((d) => d.firebase_uid)) {
      const replacement = duplicates.find((d) => d.firebase_uid);
      if (replacement) {
        await updateRowByColumn('users', 'id', canonical.id, {
          ...canonical,
          firebase_uid: replacement.firebase_uid,
          email,
          updated_at: new Date().toISOString(),
        });
        console.log(`Updated canonical user ${canonical.id} with uid ${replacement.firebase_uid}`);
      }
    } else {
      await updateRowByColumn('users', 'id', canonical.id, {
        ...canonical,
        email,
        updated_at: new Date().toISOString(),
      });
    }
  }

  console.log(`Migration complete: ${totalMerged} user IDs migrated, ${totalDeleted} duplicate users removed.`);
}

repairUserEmails().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});

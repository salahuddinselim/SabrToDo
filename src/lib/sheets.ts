import { google, sheets_v4 } from 'googleapis';

const SHEET_NAMES = {
  users: 'users',
  tasks: 'tasks',
  notifications: 'notifications',
  push_subscriptions: 'push_subscriptions',
} as const;

type SheetName = (typeof SHEET_NAMES)[keyof typeof SHEET_NAMES];

let sheetsClient: sheets_v4.Resource$Spreadsheets | null = null;
let initPromise: Promise<void> | null = null;

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getClient() {
  if (!sheetsClient) {
    const auth = getAuth();
    sheetsClient = google.sheets({ version: 'v4', auth }).spreadsheets;
  }
  return sheetsClient;
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

const HEADERS: Record<SheetName, string[]> = {
  users: ['id', 'firebase_uid', 'email', 'display_name', 'created_at', 'updated_at'],
  tasks: [
    'id', 'user_id', 'title', 'description', 'due_date',
    'priority', 'status', 'notify_before', 'created_at', 'completed_at', 'order_index',
  ],
  notifications: [
    'id', 'user_id', 'type', 'title', 'message', 'task_id', 'is_read', 'created_at',
  ],
  push_subscriptions: [
    'id', 'user_id', 'endpoint', 'subscription', 'created_at',
  ],
};

async function ensureSheetExists(sheetName: SheetName) {
  try {
    const response = await getClient().get({
      spreadsheetId: SPREADSHEET_ID,
      ranges: [sheetName],
    });
    const sheetExists = response.data.sheets?.some(
      (s) => s.properties?.title === sheetName
    );
    if (!sheetExists) {
      await getClient().batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: sheetName } } }],
        },
      });
    }
  } catch {
    await getClient().batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: sheetName } } }],
      },
    });
  }
}

export async function initSheet() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const sheets = getClient();
    try {
      await sheets.get({ spreadsheetId: SPREADSHEET_ID });
    } catch {
      initPromise = null;
      throw new Error(
        'Cannot access spreadsheet. Make sure GOOGLE_SHEET_ID is correct and the service account has Editor access.'
      );
    }

    for (const name of Object.values(SHEET_NAMES)) {
      await ensureSheetExists(name);
    }

    for (const name of Object.values(SHEET_NAMES)) {
      const result = await getClient().values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${name}!A1:Z1`,
      });
      if (!result.data.values || result.data.values[0]?.length === 0) {
        await getClient().values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${name}!A1`,
          valueInputOption: 'RAW',
          requestBody: { values: [HEADERS[name]] },
        });
      }
    }
  })();

  return initPromise;
}

export async function getAllRows(
  sheetName: SheetName
): Promise<Record<string, string>[]> {
  await initSheet();
  const result = await getClient().values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
  });

  const rows = result.data.values || [];
  if (rows.length < 2) return [];

  const headers = rows[0] as string[];
  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? '';
    });
    return record;
  });
}

export async function appendRow(
  sheetName: SheetName,
  data: Record<string, string>
) {
  await initSheet();
  const result = await getClient().values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A1:Z1`,
  });
  const headers = (result.data.values?.[0] || []) as string[];

  const values = headers.map((h) => data[h] ?? '');

  await getClient().values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [values] },
  });
}

export async function updateRowByColumn(
  sheetName: SheetName,
  columnName: string,
  matchValue: string,
  data: Record<string, string>
) {
  await initSheet();
  const result = await getClient().values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
  });

  const rows = result.data.values || [];
  if (rows.length < 2) return;

  const headers = rows[0] as string[];
  const colIndex = headers.indexOf(columnName);
  if (colIndex === -1) return;

  const rowIndex = rows.findIndex((row, i) => i > 0 && row[colIndex] === matchValue);
  if (rowIndex === -1) return;

  const newValues = headers.map((h) => data[h] ?? rows[rowIndex][headers.indexOf(h)] ?? '');

  await getClient().values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A${rowIndex + 1}`,
    valueInputOption: 'RAW',
    requestBody: { values: [newValues] },
  });
}

export async function deleteRowByColumn(
  sheetName: SheetName,
  columnName: string,
  matchValue: string
) {
  await initSheet();
  const result = await getClient().values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
  });

  const rows = result.data.values || [];
  if (rows.length < 2) return;

  const headers = rows[0] as string[];
  const colIndex = headers.indexOf(columnName);
  if (colIndex === -1) return;

  const dataRowIndex = rows.findIndex((row, i) => i > 0 && row[colIndex] === matchValue);
  if (dataRowIndex === -1) return;

  const sheetId = await getSheetId(sheetName);
  if (sheetId === null) return;

  await getClient().batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: dataRowIndex,
              endIndex: dataRowIndex + 1,
            },
          },
        },
      ],
    },
  });
}

async function getSheetId(sheetName: SheetName): Promise<number | null> {
  const response = await getClient().get({
    spreadsheetId: SPREADSHEET_ID,
    ranges: [],
    includeGridData: false,
  });
  const sheet = response.data.sheets?.find(
    (s) => s.properties?.title === sheetName
  );
  return sheet?.properties?.sheetId ?? null;
}

export async function updateMultipleRows(
  sheetName: SheetName,
  columnName: string,
  updates: Array<{ matchValue: string; data: Record<string, string> }>
) {
  await initSheet();
  const result = await getClient().values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
  });

  const rows = result.data.values || [];
  if (rows.length < 2) return;

  const headers = rows[0] as string[];
  const colIndex = headers.indexOf(columnName);
  if (colIndex === -1) return;

  for (const { matchValue, data } of updates) {
    const rowIndex = rows.findIndex((row, i) => i > 0 && row[colIndex] === matchValue);
    if (rowIndex === -1) continue;

    const newValues = headers.map((h) => data[h] ?? rows[rowIndex][headers.indexOf(h)] ?? '');
    await getClient().values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A${rowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: [newValues] },
    });
  }
}

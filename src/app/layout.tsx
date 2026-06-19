import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { PwaSetup } from '@/components/PwaSetup';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body-loaded',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display-loaded',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SabrFlow - Task Management by SabrWare',
  description: 'Calm productivity, mindful completion. A serene workspace where tasks flow naturally.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
  },
};

const themeScript = `
(function(){
  try {
    var id = JSON.parse(localStorage.getItem('todo-theme-id') || '"ocean"');
    var themes = {
      ocean: { '--bg-base':'13 15 20','--bg-surface':'19 22 29','--bg-raised':'26 30 40','--bg-hover':'34 39 54','--text-primary':'240 242 247','--text-secondary':'154 160 180','--text-placeholder':'92 98 120','--accent-blue':'108 143 255','--accent-green':'62 207 142','--accent-red':'248 113 113','--accent-yellow':'251 191 36','--accent-purple':'167 139 250' },
      solar: { '--bg-base':'26 10 0','--bg-surface':'34 18 5','--bg-raised':'46 26 10','--bg-hover':'61 38 18','--text-primary':'254 243 199','--text-secondary':'212 165 116','--text-placeholder':'138 106 60','--accent-blue':'251 191 36','--accent-green':'248 113 113','--accent-red':'251 146 60','--accent-yellow':'251 191 36','--accent-purple':'251 191 36' },
      amethyst: { '--bg-base':'10 5 20','--bg-surface':'16 10 30','--bg-raised':'26 18 46','--bg-hover':'38 26 62','--text-primary':'240 238 247','--text-secondary':'184 168 212','--text-placeholder':'122 106 148','--accent-blue':'167 139 250','--accent-green':'192 132 252','--accent-red':'232 121 249','--accent-yellow':'167 139 250','--accent-purple':'192 132 252' },
      emerald: { '--bg-base':'2 26 15','--bg-surface':'5 35 20','--bg-raised':'10 46 27','--bg-hover':'18 61 38','--text-primary':'230 247 238','--text-secondary':'138 196 164','--text-placeholder':'74 122 92','--accent-blue':'62 207 142','--accent-green':'110 231 183','--accent-red':'52 211 153','--accent-yellow':'62 207 142','--accent-purple':'110 231 183' }
    };
    var vars = themes[id] || themes.ocean;
    var root = document.documentElement;
    for (var k in vars) root.style.setProperty(k, vars[k]);
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full bg-background text-white`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-screen overflow-hidden antialiased bg-background text-white">
        <Providers>
          {children}
          <PwaSetup />
        </Providers>
      </body>
    </html>
  );
}

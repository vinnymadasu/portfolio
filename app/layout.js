import './globals.css';
import { LocaleProvider } from '@/components/LocaleProvider';

export const metadata = {
  title: 'Vineeth Rao Madasu — Full-stack developer, Hyderabad',
  description:
    'Full-stack developer in Hyderabad. Builds systems that move things across borders and make them findable. IndiaUnbox and SkilledMBA, both live, both built alone.',
  openGraph: {
    title: 'Vineeth Rao Madasu — Full-stack developer',
    description: 'I build systems that move things across borders and make them findable.',
    type: 'profile',
  },
};

export const viewport = {
  themeColor: '#ece8e1',
};

// Applies the saved theme before first paint so there is no flash.
const themeScript = `
(function(){try{
  var s=localStorage.getItem('vm-theme');
  var d=window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = s || (d ? 'dark' : 'light');
}catch(e){document.documentElement.dataset.theme='light';}})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}

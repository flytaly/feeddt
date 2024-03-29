import { Metadata } from 'next';

const m = (fileName: string) => `/static/_meta/${fileName}`;

export const metadata: Metadata = {
  title: 'RssDT',
  applicationName: 'RssDT',
  description: 'RSS/Atom feed reader and rss to to email digester',
  viewport: 'width=device-width, initial-scale=1',
  keywords: ['RSS', 'Atom', 'RSS Reader', 'Rss2Email'],
  authors: [{ name: 'flytaly', url: 'https://github.com/flytaly' }],
  manifest: 'manifest.json',
  other: {
    'msapplication-TileColor': '#ffffff',
    'msapplication-TileImage': m('ms-icon-144x144.png'),
  },
  icons: [
    /* Icons generated by favicon-generator.org */
    { rel: 'apple-touch-icon', sizes: '57x57', url: m('apple-icon-57x57.png') },
    { rel: 'apple-touch-icon', sizes: '60x60', url: m('apple-icon-60x60.png') },
    { rel: 'apple-touch-icon', sizes: '72x72', url: m('apple-icon-72x72.png') },
    { rel: 'apple-touch-icon', sizes: '76x76', url: m('apple-icon-76x76.png') },
    { rel: 'apple-touch-icon', sizes: '114x114', url: m('apple-icon-114x114.png') },
    { rel: 'apple-touch-icon', sizes: '120x120', url: m('apple-icon-120x120.png') },
    { rel: 'apple-touch-icon', sizes: '144x144', url: m('apple-icon-144x144.png') },
    { rel: 'apple-touch-icon', sizes: '152x152', url: m('apple-icon-152x152.png') },
    { rel: 'apple-touch-icon', sizes: '180x180', url: m('apple-icon-180x180.png') },
    { rel: 'icon', type: 'image/png', sizes: '192x192', url: m('android-icon-192x192.png') },
    { rel: 'icon', type: 'image/png', sizes: '32x32', url: m('favicon-32x32.png') },
    { rel: 'icon', type: 'image/png', sizes: '96x96', url: m('favicon-96x96.png') },
    { rel: 'icon', type: 'image/png', sizes: '16x16', url: m('favicon-16x16.png') },
  ],
  themeColor: '#ffffff',
};

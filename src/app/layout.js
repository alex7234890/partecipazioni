import './globals.css'

export const metadata = {
  title: 'Matteo & Clio — Partecipazione di Matrimonio',
  description: 'Siete invitati al matrimonio di Matteo Filippelli e Clio Righetti',
  openGraph: {
    title: 'Matteo & Clio — Partecipazione di Matrimonio',
    description: 'Siete invitati al nostro giorno speciale',
    images: ['/couple.jpg'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Allura&family=Lato:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}

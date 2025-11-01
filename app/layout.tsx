/**
 * Root Layout for GestionMax Backend
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GestionMax Backend API',
  description: 'Backend API Payload CMS pour GestionMax Formation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}

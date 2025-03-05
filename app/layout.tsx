import { Theme } from '@radix-ui/themes';
import { Metadata } from 'next';

import './globals.css';

import '@radix-ui/themes/styles.css';
import LoginStatus from '../components/login-satus';

export const metadata: Metadata = {
  metadataBase: new URL('https://gemini.vercel.ai'),
  title: 'Next.js Gemini Chatbot',
  description: 'Next.js chatbot template using the AI SDK and Gemini.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Theme>
          <LoginStatus />
          {children}
        </Theme>
      </body>
    </html>
  );
}

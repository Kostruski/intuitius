import { Theme, Container, Flex, Box } from '@radix-ui/themes';
import { Metadata } from 'next';

import './globals.css';

import '@radix-ui/themes/styles.css';
import LoginStatus from '../components/login-satus';

export const metadata: Metadata = {
  title: 'Elgum demo',
  description: 'Demo chat',
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
          <Flex direction="column" style={{ minHeight: '100vh' }}>
            {/* Header */}
            <Box as="header" className="sticky top-0 z-10 bg-white border-b">
              <Container size="4" py="4">
                <Flex justify="between" align="center">
                  <Box>
                    <h1 className="text-xl font-bold">Elgum chat demo</h1>
                  </Box>
                  <LoginStatus />
                </Flex>
              </Container>
            </Box>

            {/* Main content */}
            <Box className="flex-1" as="main">
              <Container size="4" py="6">
                {children}
              </Container>
            </Box>

            {/* Footer */}
            <Box as="footer" className="bg-gray-50 border-t">
              <Container size="4" py="4">
                <Flex
                  justify="between"
                  align="center"
                  className="text-sm text-gray-500"
                >
                  <Box>© {new Date().getFullYear()}Elgum chat demo</Box>
                  <Flex gap="4">
                    <a href="#" className="hover:text-gray-800">
                      Privacy
                    </a>
                    <a href="#" className="hover:text-gray-800">
                      Terms
                    </a>
                    <a href="#" className="hover:text-gray-800">
                      Contact
                    </a>
                  </Flex>
                </Flex>
              </Container>
            </Box>
          </Flex>
        </Theme>
      </body>
    </html>
  );
}

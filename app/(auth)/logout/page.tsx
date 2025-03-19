'use client';
import { Box, Flex, Text, Button, Card } from '@radix-ui/themes';
import { LogOut, Home, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getFirebaseAppClientSide } from '../../../lib/firebase/firebase';
import { handleLogout } from '../../../lib/utils';

const LogoutPage = () => {
  const router = useRouter();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [message, setMessage] = useState('Logging you out...');
  const { authInstance } = getFirebaseAppClientSide();

  useEffect(() => {
    authInstance
      .signOut()
      .then(() => {
        handleLogout().then(() => {
          setMessage('Logged out');
          setStatus('success');
        });
      })
      .catch((error) => {
        console.error('Error signing out:', error);
        setMessage('Log out error');
        setStatus('error');
      });
  }, []);

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      className="min-h-[70vh] p-4"
    >
      <Card className="w-full max-w-md p-6">
        <Flex direction="column" align="center" gap="4">
          <Box className="rounded-full bg-gray-100 p-4">
            <LogOut
              size={32}
              className={status === 'error' ? 'text-red-500' : 'text-green-500'}
            />
          </Box>

          <Text size="5" weight="bold" align="center">
            {status === 'processing'
              ? 'Logging Out'
              : status === 'success'
              ? 'Logged Out'
              : 'Logout Error'}
          </Text>

          <Text align="center" color="gray">
            {message}
          </Text>

          {status !== 'processing' && (
            <Flex gap="3" className="mt-4">
              <Button variant="outline" onClick={() => router.push('/')}>
                <Home size={16} />
                <Text>Home</Text>
              </Button>

              {status === 'success' && (
                <Button onClick={() => router.push('/login')}>
                  <Text>Log In Again</Text>
                  <ArrowRight size={16} />
                </Button>
              )}

              {status === 'error' && (
                <Button
                  color="red"
                  onClick={() => {
                    setStatus('processing');
                    setMessage('Trying again...');
                    window.location.reload();
                  }}
                >
                  <Text>Try Again</Text>
                  <ArrowRight size={16} />
                </Button>
              )}
            </Flex>
          )}
        </Flex>
      </Card>
    </Flex>
  );
};

export default LogoutPage;

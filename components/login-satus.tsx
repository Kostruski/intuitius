'use client';
import {
  Box,
  Button,
  Flex,
  Text,
  Avatar,
  DropdownMenu,
} from '@radix-ui/themes';
import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';

import {
  getFirebaseAppClientSide,
  signOutUser,
} from '../lib/firebase/firebase';

const LoginStatus = () => {
  const { authInstance } = getFirebaseAppClientSide();
  const [user, loading, error] = useAuthState(authInstance);
  const router = useRouter();

  if (loading) {
    return (
      <Box className="p-2">
        <Text size="2" color="gray">
          Loading...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-2 text-red-500">
        <Text size="2">Authentication error</Text>
      </Box>
    );
  }

  if (!user) {
    return (
      <Button variant="outline" size="2" onClick={() => router.push('/login')}>
        <User size={16} />
        <Text>Login</Text>
      </Button>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Flex align="center" gap="2" className="cursor-pointer">
          <Avatar
            size="2"
            fallback={user.email?.[0]?.toUpperCase() || 'U'}
            color="indigo"
            className="cursor-pointer"
          />
          <Text size="2" className="hidden sm:block">
            {user.email}
          </Text>
        </Flex>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>
          <Text size="2">Signed in as</Text>
          <Text size="2" weight="bold">
            {user.email}
          </Text>
        </DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={() => router.push('/profile')}>
          <User size={16} />
          <Text>Profile</Text>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item color="red" onClick={() => router.push('/logout')}>
          <LogOut size={16} />
          <Text>Log out</Text>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default LoginStatus;

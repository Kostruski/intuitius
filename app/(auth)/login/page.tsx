'use client';

import { Label } from '@radix-ui/react-label';
import { Box, Button, Card, Flex, Heading, Tabs, Text } from '@radix-ui/themes';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

import {
  signInWithEmailAndPasswordFunc,
  createUserWithEmailAndPasswordFunc,
  signInWithGoogle,
  sendPasswordResetEmailFunc,
  getFirebaseAppClientSide,
} from '../../../lib/firebase/firebase';
import { postToken } from '../../../lib/utils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const [resetPasswordSent, setResetPasswordSent] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const { authInstance } = getFirebaseAppClientSide();
  const [user] = useAuthState(authInstance);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user]);

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError('');
    try {
      const user = await signInWithEmailAndPasswordFunc(email, password);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Email/password login failed:', error);
      setLoginError(
        error.message || 'Login failed. Please check your credentials.',
      );
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignupError('');
    try {
      const user: any = await createUserWithEmailAndPasswordFunc({
        email,
        password,
      });
      if (user.accessToken) await postToken(user.accessToken);
      console.log('User created:', user);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Email/password sign-up failed:', error);
      setSignupError(error.message || 'Sign up failed. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      const idToken = await user.getIdToken();
      await postToken(idToken);
    } catch (error) {
      console.error('Sign-in failed:', error);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetPasswordError('');
    try {
      const success = await sendPasswordResetEmailFunc(resetPasswordEmail);
      if (success) {
        setResetPasswordSent(true);
      } else {
        setResetPasswordError(
          'Error sending password reset email. Check your email address.',
        );
      }
    } catch (error) {
      setResetPasswordError(
        'Error sending password reset email. Please try again.',
      );
      console.error('Password reset failed:', error);
    }
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      className="min-h-dvh p-4"
    >
      <Card className="w-full max-w-md p-6">
        <Heading size="6" align="center" mb="4">
          Account Access
        </Heading>

        <Tabs.Root defaultValue="login">
          <Tabs.List>
            <Tabs.Trigger value="login">Login</Tabs.Trigger>
            <Tabs.Trigger value="signup">Sign Up</Tabs.Trigger>
            <Tabs.Trigger value="reset">Reset Password</Tabs.Trigger>
          </Tabs.List>

          {/* Login Tab */}
          <Tabs.Content value="login">
            <Box mt="4">
              <form onSubmit={handleEmailLogin}>
                <Flex direction="column" gap="3">
                  <Box>
                    <Label className="block mb-2 text-sm font-medium">
                      Email
                    </Label>
                    <Flex align="center" className="border p-2 rounded">
                      <Mail size={16} className="mr-2 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full outline-none"
                        required
                        placeholder="Enter your email"
                      />
                    </Flex>
                  </Box>

                  <Box>
                    <Label className="block mb-2 text-sm font-medium">
                      Password
                    </Label>
                    <Flex align="center" className="border p-2 rounded">
                      <Lock size={16} className="mr-2 text-gray-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full outline-none"
                        required
                        placeholder="Enter your password"
                      />
                    </Flex>
                  </Box>

                  {loginError && (
                    <Text size="1" color="red" className="mt-1">
                      {loginError}
                    </Text>
                  )}

                  <Button type="submit" size="3" className="mt-2">
                    <LogIn size={16} />
                    <Text>Log In</Text>
                  </Button>
                </Flex>
              </form>

              <Flex align="center" justify="center" mt="4">
                <Box className="h-px bg-gray-200 w-full" />
                <Text className="px-2 text-gray-500 text-sm">OR</Text>
                <Box className="h-px bg-gray-200 w-full" />
              </Flex>

              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full mt-4"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  className="mr-2"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <Text>Sign in with Google</Text>
              </Button>
            </Box>
          </Tabs.Content>

          {/* Sign Up Tab */}
          <Tabs.Content value="signup">
            <Box mt="4">
              <form onSubmit={handleEmailSignUp}>
                <Flex direction="column" gap="3">
                  <Box>
                    <Label className="block mb-2 text-sm font-medium">
                      Email
                    </Label>
                    <Flex align="center" className="border p-2 rounded">
                      <Mail size={16} className="mr-2 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full outline-none"
                        required
                        placeholder="Enter your email"
                      />
                    </Flex>
                  </Box>

                  <Box>
                    <Label className="block mb-2 text-sm font-medium">
                      Password
                    </Label>
                    <Flex align="center" className="border p-2 rounded">
                      <Lock size={16} className="mr-2 text-gray-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full outline-none"
                        required
                        placeholder="Create a password"
                      />
                    </Flex>
                  </Box>

                  {signupError && (
                    <Text size="1" color="red" className="mt-1">
                      {signupError}
                    </Text>
                  )}

                  <Button type="submit" size="3" className="mt-2">
                    <UserPlus size={16} />
                    <Text>Create Account</Text>
                  </Button>
                </Flex>
              </form>
            </Box>
          </Tabs.Content>

          {/* Reset Password Tab */}
          <Tabs.Content value="reset">
            <Box mt="4">
              {resetPasswordSent ? (
                <Box className="p-4 bg-green-50 rounded">
                  <Text color="green">
                    Password reset email sent successfully! Please check your
                    inbox.
                  </Text>
                </Box>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <Flex direction="column" gap="3">
                    <Box>
                      <Label className="block mb-2 text-sm font-medium">
                        Email
                      </Label>
                      <Flex align="center" className="border p-2 rounded">
                        <Mail size={16} className="mr-2 text-gray-500" />
                        <input
                          type="email"
                          value={resetPasswordEmail}
                          onChange={(e) =>
                            setResetPasswordEmail(e.target.value)
                          }
                          className="w-full outline-none"
                          required
                          placeholder="Enter your email"
                        />
                      </Flex>
                    </Box>

                    {resetPasswordError && (
                      <Text size="1" color="red" className="mt-1">
                        {resetPasswordError}
                      </Text>
                    )}

                    <Button type="submit" size="3" className="mt-2">
                      <Text>Send Reset Link</Text>
                    </Button>
                  </Flex>
                </form>
              )}
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Card>
    </Flex>
  );
}

import { cookies } from 'next/headers';

import { createUser } from '../../../../db/user-queries';
import getFirebaseAppServerSide from '../../../../lib/firebase/get-firebase-app-server-side';

export type UserSchema = {
  id: string;
  userName: string;
  companyName: string;
  role: 'user' | 'admin' | 'manager';
};

export async function POST(req: Request) {
  try {
    const { idToken, userName, companyName, role } = await req.json();

    if (!idToken) {
      return Response.json({ error: 'ID token is required' }, { status: 400 });
    }

    const { auth } = getFirebaseAppServerSide();

    const user = await auth?.verifyIdToken(idToken);

    console.log('User in register:', user);

    if (user?.uid) {
      const cookieStore = await cookies();

      cookieStore.set('token', idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        path: '/',
      });

      console.log('before create user', user.uid, userName, companyName);

      const userData = await createUser({
        userId: user.uid,
        userName,
        companyName,
        role,
        companyId: companyName,
      });

      return Response.json({ userData });
    }

    return Response.json({ message: 'User register successful' });
  } catch (error) {
    console.error('Register error:', error);
    return Response.json({ error: 'Register failed' }, { status: 401 });
  }
}

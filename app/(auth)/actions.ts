'use server';

import fs from 'fs';
import path from 'path';

import { addDoc, collection } from 'firebase/firestore';

import getCloudStorage from '../../lib/cloud-storage/get-cloud-storage';
import getFirebaseAppServerSide from '../../lib/firebase/get-firebase-app-server-side';
import { RegisterProps } from '../../lib/utils';

type User = Omit<RegisterProps, 'idToken'> & {
  companyId: string;
  userId: string;
};

import 'source-map-support/register';

// import { z } from 'zod';

// import { createUser, getUser } from '@/db/queries';

// const authFormSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(6),
// });

export async function createUser(userData: User) {
  console.log('userData', userData);
  try {
    const { db } = getFirebaseAppServerSide();
    if (!db) {
      throw new Error('Firestore is not available');
    }
    const userRef = await db.collection('users').add(userData);
    console.log('Document written with ID: ', userRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
}

export async function askDocumentsQuestion(formData: FormData) {
  const prompt = formData.get('prompt');

  try {
    const response = await fetch(process.env.RAG_ENDPOINT as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Assuming the response is a multipart/form-data with text and file.
    const contentType = response.headers.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Expected application/json response.');
    }

    const jsonData = await response.json();

    return jsonData;
  } catch (error) {
    console.error('Error prompt', error);
    return { error: (error as Error).message };
  }
}

export async function downloadFile(formData: FormData) {
  const filePath = formData.get('filePath') as string;

  if (!filePath) {
    return { error: 'File path is required' };
  }

  try {
    const [bucketName, ...fileParts] = filePath.replace('gs://', '').split('/');
    const fileName = fileParts.join('/');

    const storage = getCloudStorage();

    const bucket = storage.bucket(process.env.DOCUMENTS_BUCKET_ID);
    const file = bucket.file(fileName);

    const readStream = file.createReadStream();

    const headers = new Headers({
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Type': 'application/octet-stream', // Or your specific content type
    });

    return { readStream };
  } catch (error) {
    console.error('Error downloading file:', error);
    return { error: 'Failed to download file' };
  }
}

// export interface LoginActionState {
//   status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
// }

// export const login = async (
//   _: LoginActionState,
//   formData: FormData,
// ): Promise<LoginActionState> => {
//   try {
//     const validatedData = authFormSchema.parse({
//       email: formData.get('email'),
//       password: formData.get('password'),
//     });

//     await signIn('credentials', {
//       email: validatedData.email,
//       password: validatedData.password,
//       redirect: false,
//     });

//     return { status: 'success' };
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return { status: 'invalid_data' };
//     }

//     return { status: 'failed' };
//   }
// };

// export interface RegisterActionState {
//   status:
//     | 'idle'
//     | 'in_progress'
//     | 'success'
//     | 'failed'
//     | 'user_exists'
//     | 'invalid_data';
// }

// export const register = async (
//   _: RegisterActionState,
//   formData: FormData,
// ): Promise<RegisterActionState> => {
//   try {
//     const validatedData = authFormSchema.parse({
//       email: formData.get('email'),
//       password: formData.get('password'),
//     });

//     let [user] = await getUser(validatedData.email);

//     if (user) {
//       return { status: 'user_exists' } as RegisterActionState;
//     } else {
//       await createUser(validatedData.email, validatedData.password);
//       await signIn('credentials', {
//         email: validatedData.email,
//         password: validatedData.password,
//         redirect: false,
//       });

//       return { status: 'success' };
//     }
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return { status: 'invalid_data' };
//     }

//     return { status: 'failed' };
//   }
// };

// server actions with auth checks

// // actions/authActions.ts
// 'use server';

// import { getAuth } from 'firebase-admin/auth';
// import { getAppCheck } from 'firebase-admin/app-check';
// import { initializeApp, cert, App } from 'firebase-admin/app';

// let firebaseApp: App | null = null;
// const serviceAccount = JSON.parse(
//   process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
// );

// if (!firebaseApp) {
//   firebaseApp = initializeApp({
//     credential: cert(serviceAccount),
//     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   });
// }
// const auth = getAuth(firebaseApp);
// const appCheck = getAppCheck(firebaseApp);

// export async function authorizeUser(idToken: string, appCheckToken: string) {
//   try {
//     await auth.verifyIdToken(idToken);
//     await appCheck.verifyToken(appCheckToken);
//     return { success: true };
//   } catch (error: any) {
//     console.error('Server action authorization error:', error);
//     return { success: false, error: error.message };
//   }
// }

// //Example server action
// export async function myServerAction(formData: FormData) {
//   const idToken = formData.get('idToken') as string;
//   const appCheckToken = formData.get('appCheckToken') as string;

//   const authResult = await authorizeUser(idToken, appCheckToken);

//   if (!authResult.success) {
//     return { error: authResult.error };
//   }

//   // Your server action logic here
//   return { message: 'Server action successful' };
// }

// action use with auth in client
// components/ProtectedComponent.tsx
// 'use client';

// import { useState } from 'react';
// import { myServerAction } from '../actions/authActions';

// const ProtectedComponent = () => {
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');

//   const handleAction = async () => {
//     const idToken = localStorage.getItem('idToken'); // Or wherever you store the token
//     const appCheckToken = localStorage.getItem('appCheckToken'); // Or wherever you store the token

//     if (!idToken || !appCheckToken) {
//       setError('Tokens missing');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('idToken', idToken);
//     formData.append('appCheckToken', appCheckToken);

//     const result = await myServerAction(formData);

//     if (result.error) {
//       setError(result.error);
//       setMessage('');
//     } else {
//       setMessage(result.message);
//       setError('');
//     }
//   };

//   return (
//     <div>
//       <button onClick={handleAction}>Run Server Action</button>
//       {message && <p>{message}</p>}
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//     </div>
//   );
// };

// export default ProtectedComponent;

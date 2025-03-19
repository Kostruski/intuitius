// firebase.ts
import { ne } from 'drizzle-orm';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

import { handleLogout, handleUserRegister, postToken } from '../utils';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp; //Declare a variable to hold the app instance.
let authInstance: Auth; //Declare a variable to hold the auth instance.

export const getFirebaseAppClientSide = () => {
  if (!app) {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
  }
  return { app, authInstance };
};

const { app: firebaseApp, authInstance: firebaseAuth } =
  getFirebaseAppClientSide();

onAuthStateChanged(firebaseAuth, async (user) => {
  try {
    if (user) {
      const idToken = await user.getIdToken(); // Get fresh token
      // Send idToken with your API request to the server
      await postToken(idToken);
    }
  } catch (error) {
    console.error('Auth state change error:', error);
    await handleLogout();
  }
});

// Example: Google Sign-In Provider (add more providers as needed)
export const googleProvider = new GoogleAuthProvider();

// Example functions (move these to a more appropriate location in your app)
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    const user = result.user;
    console.log('Signed in with Google:', user);
    // Handle successful sign-in
    // Redirect to a protected route or update UI
    const idToken = await user.getIdToken();
    await postToken(idToken);
    return user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    // Handle sign-in error
    throw error;
  }
}

export async function signOutUser() {
  try {
    await signOut(firebaseAuth);
    await handleLogout();
  } catch (error) {
    console.error('Sign-out error:', error);
    // Handle sign-out error
  }
}

export async function createUserWithEmailAndPasswordFunc({
  email,
  password,
  userName = 'testuser',
  companyName = 'testcompany',
  role = 'user',
}: {
  email: string;
  password: string;
  userName?: string;
  companyName?: string;
  role?: 'user' | 'manager';
}) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      password,
    );
    const user = userCredential.user;
    console.log('User created:', user);
    const idToken = await user.getIdToken();
    const currentUser = await handleUserRegister({
      idToken,
      userName,
      companyName,
      role,
    });
    return currentUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function signInWithEmailAndPasswordFunc(
  email: string,
  password: string,
) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password,
    );
    const user = userCredential.user;
    console.log('Signed in with email:', user);
    const idToken = await user.getIdToken();
    await postToken(idToken);
    return user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

export async function sendPasswordResetEmailFunc(email: string) {
  try {
    await sendPasswordResetEmail(firebaseAuth, email);
    console.log('Password reset email sent successfully!');
    // Optionally, redirect the user or display a success message.
    return true; // Indicate success
  } catch (error) {
    console.error('Error sending password reset email:', error);
    // Handle errors appropriately (e.g., display an error message)
    return false; // Indicate failure
  }
}

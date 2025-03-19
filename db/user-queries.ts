import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

import getFirebaseAppServerSide from '../lib/firebase/get-firebase-app-server-side';
import { RegisterProps } from '../lib/utils';

type User = Omit<RegisterProps, 'idToken'> & {
  companyId: string;
  userId: string;
};

// Create a new user
async function createUser(userData: User) {
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

// Get all users
// async function getAllUsers() {
// 	const users: {}[] = [];
//   const querySnapshot = await getDocs(collection(db, 'users'));
//   querySnapshot.forEach((doc) => {
//     users.push({ id: doc.id, ...doc.data() });
//   });
//   return users;
// }

//Get a specific user by id
// async function getUserById(userId) {
//   const docRef = doc(db, 'users', userId);
//   const docSnap = await getDoc(docRef);

//   if (docSnap.exists()) {
//     return { id: docSnap.id, ...docSnap.data() };
//   } else {
//     console.log('No such document!');
//     return null;
//   }
// }

//Update a user
// async function updateUser(userId, updatedData) {
//   const userRef = doc(db, 'users', userId);
//   await updateDoc(userRef, updatedData);
//   console.log('Document updated successfully!');
// }

// //Delete a user
// async function deleteUser(userId) {
//   const userRef = doc(db, 'users', userId);
//   await deleteDoc(userRef);
//   console.log('Document deleted successfully!');
// }

export { createUser };

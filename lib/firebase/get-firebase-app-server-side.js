const path = require('path');

const admin = require('firebase-admin');

const getFirebaseAppServerSide = () => {
  // Initialize Firebase Admin SDK ONLY ONCE at the top level of your api route
  let firebaseApp = null;
  let auth = null;
  let db = null;

  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT || '{}',
    );

    if (admin.apps.length === 0) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      firebaseApp = admin.apps[0];
    }

    auth = admin.auth(firebaseApp);

    db = admin.firestore(firebaseApp);
  } catch (error) {
    console.error('Firebase admin initialization error', error.stack);
  }

  return { firebaseApp, auth: auth, db };
};

module.exports = getFirebaseAppServerSide;

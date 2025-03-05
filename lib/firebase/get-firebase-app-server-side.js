const path = require('path');

const admin = require('firebase-admin');

const getFirebaseAppServerSide = () => {
  // Initialize Firebase Admin SDK ONLY ONCE at the top level of your api route
  let firebaseApp = null;

  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT || '{}',
  );

  console.log('serviceAccount', process.env.NODE_ENV, serviceAccount);

  if (admin.apps.length === 0) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    firebaseApp = admin.apps[0];
  }

  const auth = admin.auth(firebaseApp);

  return { firebaseApp, auth: auth };
};

module.exports = getFirebaseAppServerSide;

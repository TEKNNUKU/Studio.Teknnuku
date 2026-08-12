// ═══════════════════════════════════════════════════════════════
//  Shared Firebase Admin SDK initializer.
//
//  Reads the service account key from the FIREBASE_SERVICE_ACCOUNT_KEY
//  env var, which should hold the ENTIRE service account JSON, base64-
//  encoded onto a single line (see README.md for how to generate this).
//  We initialize once and reuse across warm serverless invocations.
// ═══════════════════════════════════════════════════════════════

const admin = require('firebase-admin');

let app;

function getAdminApp() {
  if (app) return admin;
  if (admin.apps.length) { app = admin.apps[0]; return admin; }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY env var is not set — see README.md.');
  }

  let serviceAccount;
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    serviceAccount = JSON.parse(decoded);
  } catch (e) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not valid base64-encoded JSON.');
  }

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  return admin;
}

module.exports = { getAdminApp };

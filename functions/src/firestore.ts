import admin from './admin';

const db = admin.firestore();
db.settings({ timestampsInSnapshots: true });

export default db;

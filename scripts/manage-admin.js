#!/usr/bin/env node
require("dotenv").config({ path: ".env.local" });
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, "\n");
}

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing Firebase credentials in .env.local");
  process.exit(1);
}

const app = getApps().length > 0 ? getApps()[0] : initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
  projectId,
});

const db = getFirestore(app);

async function listUsers() {
  console.log("\n--- Current Users in Database ---");
  const snapshot = await db.collection("users").get();
  if (snapshot.empty) {
    console.log("No registered users found in 'users' collection.");
    return;
  }

  let adminCount = 0;
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const isAdmin = data.role === "admin";
    if (isAdmin) adminCount++;
    console.log(`• [${data.role?.toUpperCase() || "USER"}] ${data.email} (${data.name || "No name"}) - ID: ${doc.id}`);
  });
  console.log(`\nTotal users: ${snapshot.size} (Admins: ${adminCount})\n`);
}

async function setRole(email, role) {
  if (!email) {
    console.error("Please specify an email address.");
    console.log("Usage: node scripts/manage-admin.js <add|remove> <email>");
    process.exit(1);
  }

  const query = await db.collection("users").where("email", "==", email.trim().toLowerCase()).get();
  if (query.empty) {
    console.error(`User with email '${email}' was not found in the 'users' collection.`);
    console.log("Tip: The user must sign in or register at least once to create their account record.");
    process.exit(1);
  }

  const userDoc = query.docs[0];
  await userDoc.ref.update({
    role: role,
    updatedAt: new Date(),
  });

  console.log(`\nSuccessfully updated role for ${email} to: '${role}'`);
  console.log(`User ID: ${userDoc.id}`);
  if (role === "admin") {
    console.log("This user can now access http://localhost:3000/admin and view the Admin Panel.");
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();
  const targetEmail = args[1];

  switch (command) {
    case "list":
      await listUsers();
      break;
    case "add":
    case "grant":
    case "promote":
      await setRole(targetEmail, "admin");
      break;
    case "remove":
    case "revoke":
    case "demote":
      await setRole(targetEmail, "user");
      break;
    default:
      console.log("\n=== GDG Recruitment Admin Management Tool ===");
      console.log("Commands:");
      console.log("  node scripts/manage-admin.js list                 - List all users and their roles");
      console.log("  node scripts/manage-admin.js add <email>          - Grant admin privileges to email");
      console.log("  node scripts/manage-admin.js remove <email>       - Revoke admin privileges from email");
      console.log("\nExamples:");
      console.log("  node scripts/manage-admin.js add admin@example.com");
      console.log("  node scripts/manage-admin.js list\n");
      await listUsers();
      break;
  }
}

main().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});

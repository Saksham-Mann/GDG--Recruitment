import { connect } from "../db";

const COLLECTION_NAME = "users";
const ALLOWED_QUERY_FIELDS = ["id", "email", "registrationNumber"];
const ALLOWED_DATA_FIELDS = [
  "id",
  "name",
  "email",
  "registrationNumber",
  "role",
  "image",
  "emailVerified",
];

class UserModel {
  constructor(data) {
    // Sanitize and whitelist fields to prevent mass assignment
    const sanitized = {};
    if (data && typeof data === "object") {
      for (const key of ALLOWED_DATA_FIELDS) {
        if (data[key] !== undefined && data[key] !== null) {
          // Ensure primitives
          if (typeof data[key] === "string" || typeof data[key] === "boolean" || typeof data[key] === "number") {
            sanitized[key] = data[key];
          }
        }
      }
    }
    this.data = sanitized;
  }

  async save() {
    const db = await connect();
    const docRef = await db.collection(COLLECTION_NAME).add({
      ...this.data,
      createdAt: new Date(),
    });
    const snapshot = await docRef.get();
    return { id: docRef.id, ...snapshot.data() };
  }

  static async create(user) {
    return new UserModel(user).save();
  }

  static async findOne(query = {}) {
    if (!query || typeof query !== "object") return null;

    const entries = Object.entries(query);
    if (entries.length === 0) return null;

    const [field, value] = entries[0];

    // Prevent NoSQL injection and ensure field is strictly whitelisted
    if (!field || !ALLOWED_QUERY_FIELDS.includes(field)) {
      return null;
    }

    // Ensure value is a primitive string or number (not an injected query object/operator)
    if (typeof value !== "string" && typeof value !== "number") {
      return null;
    }

    const db = await connect();
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where(field, "==", value)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
}

export default UserModel;

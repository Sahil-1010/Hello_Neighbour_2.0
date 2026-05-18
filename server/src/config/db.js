const mongoose = require("mongoose");

module.exports = async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Drop legacy email_1 index left over from an earlier schema version.
    // Current schema stores contact (email or phone) in the `contact` field.
    // The old sparse unique index on `email` causes E11000 when email is null.
    try {
      await mongoose.connection.collection("users").dropIndex("email_1");
      console.log("Dropped stale users.email_1 index");
    } catch (_) {
      // Index already gone — nothing to do
    }
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

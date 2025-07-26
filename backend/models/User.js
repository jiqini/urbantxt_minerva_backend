const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  emailOrPhone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
// this file defines the User model for the application, which includes fields for username, email or phone, and password.
// It uses Mongoose to create a schema and model for MongoDB interactions.
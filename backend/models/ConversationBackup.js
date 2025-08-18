const mongoose = require('mongoose');

const conversationBackupSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  encryptedConversations: {
    type: mongoose.Schema.Types.Mixed, // Stores encrypted conversation data
    required: true
  },
  lastBackup: {
    type: Date,
    default: Date.now
  },
  backupCount: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Index for faster queries
conversationBackupSchema.index({ userId: 1 });
conversationBackupSchema.index({ lastBackup: -1 });

module.exports = mongoose.model('ConversationBackup', conversationBackupSchema);
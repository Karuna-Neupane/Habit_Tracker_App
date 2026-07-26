// Mongoose ChatMessage Schema — AI Chatbot (premium feature)
//
// Every message in an AI Coach chatbot conversation — from the user or the
// assistant — is stored as its own document, tagged with the owning user's
// id. This is what makes the conversation persist across refresh and login:
// GET /api/ai/chat/history just re-queries these documents in order.

const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'userId is required'],
      index:    true,
    },

    role: {
      type:    String,
      enum:    ['user', 'assistant'],
      required: true,
    },

    content: {
      type:      String,
      required:  [true, 'Message content is required'],
      trim:      true,
      maxlength: [4000, 'Message must be 4000 characters or fewer'],
    },
  },
  {
    timestamps: true, // createdAt doubles as the message timestamp
  }
);

// Conversation history is always fetched in creation order, scoped per user.
ChatMessageSchema.index({ userId: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);

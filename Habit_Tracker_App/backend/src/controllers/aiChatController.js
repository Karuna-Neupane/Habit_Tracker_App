// AI Chatbot Controller — premium feature alongside the AI Coach
//
// POST   /api/ai/chat          — send a message, get a contextual reply
// GET    /api/ai/chat/history  — load the user's full saved conversation
// DELETE /api/ai/chat/history  — clear the user's saved conversation
//
// Every chat turn is grounded in the SAME real habit stats the coaching
// card uses (utils/habitStats.js) plus the user's own prior messages, so
// Gemini answers contextually and personally without ever inventing a
// number that isn't actually in MongoDB. Both the user's message and the
// assistant's reply are persisted, so refreshing the page or logging back
// in restores the full conversation.

const Habit = require('../models/Habit');
const ChatMessage = require('../models/ChatMessage');
const { getUserHabitStats } = require('../utils/habitStats');
const gemini = require('../utils/gemini');

// How many prior turns to feed back to Gemini as conversation context.
// Keeps the prompt small/cheap while still giving real continuity.
const HISTORY_WINDOW = 20;

function buildSystemInstruction(summaries, overall) {
  return `You are "Coach", Habitra's encouraging AI habit coach, chatting with the user inside the app.

Ground rules:
- Only use the REAL habit data provided below. NEVER invent a streak, percentage, or habit name that isn't in this data.
- If asked about a habit or number that isn't in the data, say you don't have that information rather than guessing.
- Be warm, practical, and encouraging — like a supportive coach, not a generic chatbot.
- Keep replies conversational and concise (usually 2-5 sentences), using specific numbers from the data when relevant.
- You may suggest concrete, actionable next steps based on the user's actual habits.
- Do not use markdown headers or code fences; plain conversational text only (light formatting like short lists is fine).

The user's current real habit data (JSON):
Overall stats: ${JSON.stringify(overall)}
Per-habit stats: ${JSON.stringify(summaries)}`;
}

// POST /api/ai/chat
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'A non-empty message is required.' });
    }
    const trimmed = message.trim().slice(0, 4000);

    const [{ summaries, overall }, priorMessages] = await Promise.all([
      getUserHabitStats(Habit, req.user.id),
      ChatMessage.find({ userId: req.user.id }).sort({ createdAt: 1 }),
    ]);

    // Save the user's message immediately so it's never lost even if the
    // Gemini call below fails.
    const userDoc = await ChatMessage.create({
      userId: req.user.id,
      role: 'user',
      content: trimmed,
    });

    const recentHistory = priorMessages.slice(-HISTORY_WINDOW);
    const contents = [
      ...recentHistory.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: trimmed }] },
    ];

    let replyText;
    let source = 'gemini';

    if (!gemini.isConfigured()) {
      replyText = buildFallbackReply(trimmed, summaries, overall);
      source = 'fallback';
    } else {
      try {
        replyText = await gemini.generate(contents, {
          systemInstruction: buildSystemInstruction(summaries, overall),
        });
      } catch (err) {
        console.error('Gemini chat call failed, using fallback:', err.message);
        replyText = buildFallbackReply(trimmed, summaries, overall);
        source = 'fallback';
      }
    }

    const assistantDoc = await ChatMessage.create({
      userId: req.user.id,
      role: 'assistant',
      content: replyText,
    });

    return res.status(200).json({
      userMessage: {
        id: String(userDoc._id),
        role: 'user',
        content: userDoc.content,
        createdAt: userDoc.createdAt,
      },
      reply: {
        id: String(assistantDoc._id),
        role: 'assistant',
        content: assistantDoc.content,
        createdAt: assistantDoc.createdAt,
      },
      source,
    });
  } catch (err) {
    console.error('AI Chat error:', err.message);
    return res.status(500).json({ message: 'Could not reach the AI chatbot right now.' });
  }
};

// Rule-based fallback so the chatbot still responds if Gemini isn't
// configured or its call fails — grounded only in real numbers, never
// invented ones.
function buildFallbackReply(userText, summaries, overall) {
  if (summaries.length === 0) {
    return "You don't have any habits tracked yet, so I don't have data to work with. Add your first habit from My Habits and check back in — I'll be able to give you real feedback once there's some history!";
  }
  const { avgMonthlyRate, avgWeeklyRate, strongest, weakest, totalCurrentStreakDays } = overall;
  return `Right now you're averaging ${avgMonthlyRate}% completion over the last 30 days (${avgWeeklyRate}% this week), with ${totalCurrentStreakDays} combined current streak days. "${strongest?.name}" is your strongest habit, and "${weakest?.name}" could use a bit more attention. (The AI coach is running in offline mode right now, so this reply is generated from your real stats rather than Gemini.)`;
}

// GET /api/ai/chat/history 
exports.getHistory = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ userId: req.user.id }).sort({ createdAt: 1 });
    return res.status(200).json({
      messages: messages.map((m) => ({
        id: String(m._id),
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/ai/chat/history
exports.clearHistory = async (req, res) => {
  try {
    await ChatMessage.deleteMany({ userId: req.user.id });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

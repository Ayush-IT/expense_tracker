const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  vendor: { type: String },
  amount: { type: Number, required: true, min: 0 },
  dueDate: { type: Date, required: true },
  notes: { type: String },
  category: { type: String },
  status: { type: String, enum: ['upcoming', 'due_today', 'overdue', 'paid', 'paused'], default: 'upcoming' },

  // Recurrence
  isRecurring: { type: Boolean, default: false },
  recurrenceType: { type: String, enum: ['none', 'weekly', 'monthly', 'custom'], default: 'none' },
  customIntervalDays: { type: Number, default: null },
  recurUntil: { type: Date, default: null },
  nextRunAt: { type: Date, default: null },
  lastGeneratedAt: { type: Date, default: null },

  // Reminders
  remindersEnabled: { type: Boolean, default: true },
  remindDaysBefore: { type: [Number], default: [7, 3, 1] },
  remindAtHourLocal: { type: Number, default: 9 }, // 09:00 local time
  lastReminderSentAt: { type: Date, default: null },
  reminderHistory: { type: [{ dateKey: String, sentAt: Date }], default: [] },

  // Timezone
  timezone: { type: String, default: 'Asia/Kolkata' },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Bill', BillSchema);

const mongoose = require('mongoose');

const QueryHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompt: { type: String, required: true },
  dbType: { type: String, enum: ['mongodb', 'sql'], required: true },
  generatedQuery: { type: String, required: true },
  explanation: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QueryHistory', QueryHistorySchema);

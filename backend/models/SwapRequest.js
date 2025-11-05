const mongoose = require('mongoose');
const { SWAP_STATUS } = require('../utils/enums');

const SwapRequestSchema = new mongoose.Schema({
  mySlot: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  theirSlot: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  responder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: Object.values(SWAP_STATUS), default: SWAP_STATUS.PENDING }
}, { timestamps: true });

module.exports = mongoose.model('SwapRequest', SwapRequestSchema);
    
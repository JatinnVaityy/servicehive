const mongoose = require('mongoose');
const { EVENT_STATUS } = require('../utils/enums');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: Object.values(EVENT_STATUS), default: EVENT_STATUS.BUSY },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);

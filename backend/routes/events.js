const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const { EVENT_STATUS } = require('../utils/enums');

// Create event
router.post('/', auth, async (req, res) => {
  try {
    const { title, startTime, endTime, status } = req.body;
    if (!title || !startTime || !endTime) return res.status(400).json({ message: 'title, startTime, endTime required' });

    const event = new Event({
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: status || EVENT_STATUS.BUSY,
      owner: req.user.id
    });

    await event.save();
    res.json(event);
  } catch (err) {
    console.error('create event err', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all events for current user
router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.find({ owner: req.user.id }).sort({ startTime: 1 });
    res.json(events);
  } catch (err) {
    console.error('get events err', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Not allowed' });

    const { title, startTime, endTime, status } = req.body;
    if (title !== undefined) event.title = title;
    if (startTime !== undefined) event.startTime = new Date(startTime);
    if (endTime !== undefined) event.endTime = new Date(endTime);
    if (status !== undefined && Object.values(EVENT_STATUS).includes(status)) event.status = status;

    await event.save();
    res.json(event);
  } catch (err) {
    console.error('update event err', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Not allowed' });

    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error('delete event err', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

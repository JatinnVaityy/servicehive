const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const SwapRequest = require('../models/SwapRequest');
const { EVENT_STATUS, SWAP_STATUS } = require('../utils/enums');

// Get swappable slots
router.get('/swappable-slots', auth, async (req, res) => {
  try {
    const slots = await Event.find({ owner: { $ne: req.user.id }, status: EVENT_STATUS.SWAPPABLE })
      .populate('owner', 'name email');
    res.json(slots);
  } catch (err) {
    console.error('get swappable err', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create swap request
router.post('/swap-request', auth, async (req, res) => {
  const { mySlotId, theirSlotId } = req.body;
  if (!mySlotId || !theirSlotId) return res.status(400).json({ message: 'mySlotId and theirSlotId required' });

  try {
    const mySlot = await Event.findById(mySlotId);
    const theirSlot = await Event.findById(theirSlotId);

    if (!mySlot || !theirSlot) return res.status(404).json({ message: 'One or both slots not found' });
    if (mySlot.owner.toString() !== req.user.id) return res.status(403).json({ message: 'mySlot must belong to requester' });
    if (theirSlot.owner.toString() === req.user.id) return res.status(400).json({ message: 'Cannot request your own slot' });
    if (mySlot.status !== EVENT_STATUS.SWAPPABLE || theirSlot.status !== EVENT_STATUS.SWAPPABLE)
      return res.status(400).json({ message: 'Both slots must be SWAPPABLE' });

    const swapReq = new SwapRequest({
      mySlot: mySlot._id,
      theirSlot: theirSlot._id,
      requester: req.user.id,
      responder: theirSlot.owner,
      status: SWAP_STATUS.PENDING
    });

    mySlot.status = EVENT_STATUS.SWAP_PENDING;
    theirSlot.status = EVENT_STATUS.SWAP_PENDING;

    await mySlot.save();
    await theirSlot.save();
    await swapReq.save();

    const populated = await SwapRequest.findById(swapReq._id)
      .populate('mySlot theirSlot requester responder', 'title startTime endTime owner name email');

    res.status(201).json(populated);
  } catch (err) {
    console.error('create swap err', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Swap response
router.post('/swap-response/:requestId', auth, async (req, res) => {
  const { requestId } = req.params;
  const { accept } = req.body;

  try {
    const swapReq = await SwapRequest.findById(requestId);
    if (!swapReq) return res.status(404).json({ message: 'Swap request not found' });
    if (swapReq.responder.toString() !== req.user.id) return res.status(403).json({ message: 'Only responder can accept/reject' });
    if (swapReq.status !== SWAP_STATUS.PENDING) return res.status(400).json({ message: 'Swap request already resolved' });

    const mySlot = await Event.findById(swapReq.mySlot);
    const theirSlot = await Event.findById(swapReq.theirSlot);
    if (!mySlot || !theirSlot) return res.status(404).json({ message: 'One or both slots not found' });
if (accept) {
  // swap owners
  const tempOwner = mySlot.owner;
  mySlot.owner = theirSlot.owner;
  theirSlot.owner = tempOwner;

  // mark both as BUSY
  mySlot.status = EVENT_STATUS.BUSY;
  theirSlot.status = EVENT_STATUS.BUSY;
  swapReq.status = SWAP_STATUS.ACCEPTED;
} else {
  // reject
  mySlot.status = EVENT_STATUS.SWAPPABLE;
  theirSlot.status = EVENT_STATUS.SWAPPABLE;
  swapReq.status = SWAP_STATUS.REJECTED;
}

    await mySlot.save();
    await theirSlot.save();
    await swapReq.save();

    const populated = await SwapRequest.findById(swapReq._id)
      .populate('mySlot theirSlot requester responder', 'title startTime endTime owner name email');

    res.json({ message: accept ? 'Swap accepted' : 'Swap rejected', swap: populated });
  } catch (err) {
    console.error('swap response err', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Incoming / Outgoing requests
router.get('/requests/incoming', auth, async (req, res) => {
  try {
    const incoming = await SwapRequest.find({ responder: req.user.id })
      .populate('mySlot theirSlot requester responder', 'title startTime endTime owner name email')
      .sort({ createdAt: -1 });
    res.json(incoming);
  } catch (err) {
    console.error('get incoming err', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/requests/outgoing', auth, async (req, res) => {
  try {
    const outgoing = await SwapRequest.find({ requester: req.user.id })
      .populate('mySlot theirSlot requester responder', 'title startTime endTime owner name email')
      .sort({ createdAt: -1 });
    res.json(outgoing);
  } catch (err) {
    console.error('get outgoing err', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

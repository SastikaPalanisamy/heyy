const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');

router.get('/', async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json(polls);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/create', async (req, res) => {
  try {
    const { title, description, options, author } = req.body;
    const formatted = (options || []).filter(Boolean).map(opt => ({ text: opt }));
    const p = new Poll({ title, description, options: formatted, author, voters: [] });
    await p.save();
    res.json({ status: 'ok', poll: p });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/vote/:id', async (req, res) => {
  try {
    const { optionIndex, userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ error: 'Not found' });
    if (!poll.options[optionIndex]) return res.status(400).json({ error: 'Invalid option' });

    const existing = poll.voters && poll.voters.find(v => v.userId === userId);
    if (!existing) {
      // add vote
      poll.options[optionIndex].votes = (poll.options[optionIndex].votes || 0) + 1;
      poll.voters = poll.voters || [];
      poll.voters.push({ userId, optionIndex });
      await poll.save();
      return res.json({ status: 'ok', action: 'voted', poll });
    }

    if (existing.optionIndex === optionIndex) {
      // unvote
      poll.options[optionIndex].votes = Math.max(0, (poll.options[optionIndex].votes || 0) - 1);
      poll.voters = poll.voters.filter(v => v.userId !== userId);
      await poll.save();
      return res.json({ status: 'ok', action: 'unvoted', poll });
    }

    // switch vote to another option
    poll.options[existing.optionIndex].votes = Math.max(0, (poll.options[existing.optionIndex].votes || 0) - 1);
    poll.options[optionIndex].votes = (poll.options[optionIndex].votes || 0) + 1;
    existing.optionIndex = optionIndex;
    await poll.save();
    return res.json({ status: 'ok', action: 'switched', poll });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

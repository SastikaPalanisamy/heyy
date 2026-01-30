const express = require("express");
const router = express.Router();
const Petition = require("../models/Petition");
const Poll = require("../models/Poll");

// 1. GET ALL (Normal list view-ku)
router.get("/", async (req, res) => {
  try {
    const petitions = await Petition.find().sort({ createdAt: -1 });
    res.json(petitions);
  } catch (err) {
    res.status(500).json({ error: "Data fetch error!" });
  }
});

// 2. CREATE NEW
router.post("/create", async (req, res) => {
  try {
    const newPetition = new Petition(req.body);
    await newPetition.save();
    res.json({ message: "Launched Successfully! 🚀" });
  } catch (err) {
    res.status(500).json({ error: "Save panna mudila!" });
  }
});

// 3. SIGN LOGIC (+1 Count and User Tracking)
router.post("/sign/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    const petition = await Petition.findById(req.params.id);
    if (!petition) return res.status(404).json({ message: 'Petition missing' });

    const already = petition.signers && petition.signers.includes(userId);
    if (already) {
      // un-sign
      petition.signers = petition.signers.filter(s => s !== userId);
      petition.currentSignatures = Math.max(0, petition.currentSignatures - 1);
      await petition.save();
      return res.json({ action: 'unsigned', current: petition.currentSignatures });
    }

    // sign
    petition.signers = petition.signers || [];
    petition.signers.push(userId);
    petition.currentSignatures = (petition.currentSignatures || 0) + 1;
    await petition.save();
    return res.json({ action: 'signed', current: petition.currentSignatures });
  } catch (err) {
    res.status(500).json({ error: "Signing error!" });
  }
});

// 4. STATS & FEED LOGIC (Dashboard-ku migavum mukkiyam!)
router.get("/dashboard-data/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const userName = req.query.userName || '';
    // Fetch petitions and polls
    const [petitions, polls] = await Promise.all([
      Petition.find().sort({ createdAt: -1 }).lean(),
      Poll.find().sort({ createdAt: -1 }).lean()
    ]);

    // Unify feed items with a `type` field
    const unified = [
      ...petitions.map(p => ({ ...p, type: 'petition' })),
      ...polls.map(p => ({ ...p, type: 'poll' }))
    ];

    // Filter: Last 48 Hours Updates (Insta-feed logic)
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const recentFeed = unified.filter(item => new Date(item.createdAt) >= fortyEightHoursAgo)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Personal Stats
    const myPetitions = petitions.filter(p => p.author === userName).length;
    const signedByMe = petitions.filter(p => p.signers && p.signers.includes(userId)).length;
    const pollsVoted = polls.filter(p => p.voters && p.voters.some(v => v.userId === userId)).length;

    res.json({
      feed: recentFeed,
      stats: {
        myCount: myPetitions,
        signedCount: signedByMe,
        pollsVoted: pollsVoted,
        communityCount: petitions.length + polls.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
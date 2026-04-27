const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../../generated/prisma/client');

const prisma = new PrismaClient();

// CREATE NEW FACTION
router.put('/new', async (req, res) => {
  try {
    const { name, iconUrl, ownerId } = req.body;

    if (!name || !ownerId) {
      return res.status(400).json({ error: 'Missing name or ownerId' });
    }

    const faction = await prisma.faction.create({
      data: {
        name,
        iconUrl: iconUrl || null,
        ownerId,
        members: {
          connect: { id: ownerId } // Add owner as member
        },
        topics: {
          create: [{ name: 'general', order: 0 }] // default channel
        }
      },
      include: { topics: true } // return topics along with faction
    });

    res.json(faction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create faction' });
  }
});

// UPDATE FACTION NAME / ICON
router.post('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, iconUrl } = req.body;

    const updatedFaction = await prisma.faction.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(iconUrl && { iconUrl })
      },
      include: { topics: true }
    });

    res.json(updatedFaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update faction' });
  }
});

// GET ALL FACTIONS
router.get('/', async (req, res) => {
    try {
        const factions = await prisma.faction.findMany({
            include: { topics: true }
        });
        res.json(factions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch factions' });
    }
});

module.exports = router;
// CREATE TOPIC (channel)
router.post('/:factionId/topics', async (req, res) => {
    try {
        const { name } = req.body;
        const { factionId } = req.params;

        const topic = await prisma.topic.create({
            data: {
                name,
                order: 0,
                factionId: parseInt(factionId)
            }
        });

        res.json(topic);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create topic' });
    }
});
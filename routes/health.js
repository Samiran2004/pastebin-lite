import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        res.json({ ok: true });
    } catch {
        res.status(500).json({ ok: false });
    }
});

export default router;
import express from "express";
import { nanoid } from "nanoid";
import { client } from "../redis.js";
import { nowMs } from "../utils/time.js";
import Config from "../configs/config.js";
import { validateCreate } from "../utils/validation.js";

const router = express.Router();

/**
 * POST /api/pastes
 * Create a new paste
 */
router.post("/", async (req, res) => {
    try {
        // 1. Validate input
        const error = validateCreate(req.body);
        if (error) {
            return res.status(400).json({ error });
        }

        // 2. Extract body
        const { content, ttl_seconds, max_views } = req.body;

        // 3. Generate ID
        const id = nanoid(8);

        // 4. Time handling (deterministic-safe)
        const createdAt = nowMs(req);

        // 5. Build paste object
        const paste = {
            content,
            created_at: createdAt,
            expires_at: ttl_seconds
                ? createdAt + ttl_seconds * 1000
                : null,
            max_views: max_views ?? null,
            views: 0
        };

        // 6. Persist in Redis
        await client.set(
            `paste:${id}`,
            JSON.stringify(paste)
        );

        // 7. Respond
        return res.status(201).json({
            id,
            url: `${Config.BASE_URL}/p/${id}`
        });

    } catch (err) {
        console.error("Create paste failed:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * GET /api/pastes/:id
 * Fetch a paste (counts as a view)
 */
router.get("/:id", async (req, res) => {
    try {
        const key = `paste:${req.params.id}`;

        // 1. Fetch paste
        const raw = await client.get(key);
        if (!raw) {
            return res.status(404).json({ error: "Not found" });
        }

        const paste = JSON.parse(raw);
        const now = nowMs(req);

        // 2. TTL check
        if (paste.expires_at && now >= paste.expires_at) {
            await client.del(key); // optional cleanup
            return res.status(404).json({ error: "Expired" });
        }

        // 3. View limit check
        if (paste.max_views !== null && paste.views >= paste.max_views) {
            return res.status(404).json({ error: "View limit exceeded" });
        }

        // 4. Increment views
        paste.views += 1;

        await client.set(key, JSON.stringify(paste));

        // 5. Respond
        return res.status(200).json({
            content: paste.content,
            remaining_views:
                paste.max_views === null
                    ? null
                    : Math.max(paste.max_views - paste.views, 0),
            expires_at: paste.expires_at
                ? new Date(paste.expires_at).toISOString()
                : null
        });

    } catch (err) {
        console.error("Fetch paste failed:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});


/**
 * GET /p/:id
 * Render paste as HTML (does NOT count as view)
 */
router.get("/p/:id", async (req, res) => {
    try {
        const key = `paste:${req.params.id}`;
        const raw = await client.get(key);

        if (!raw) {
            return res.sendStatus(404);
        }

        const paste = JSON.parse(raw);
        const now = nowMs(req);

        // TTL check
        if (paste.expires_at && now >= paste.expires_at) {
            return res.sendStatus(404);
        }

        // View limit check
        if (paste.max_views !== null && paste.views >= paste.max_views) {
            return res.sendStatus(404);
        }

        // Render safely with EJS
        return res.status(200).render("paste", {
            content: paste.content
        });

    } catch (err) {
        console.error("Render paste failed:", err);
        return res.sendStatus(500);
    }
});


export default router;

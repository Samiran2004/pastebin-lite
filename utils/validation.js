export function validateCreate(body) {
    const { content, ttl_seconds, max_views } = body;

    if (!content || typeof content !== "string" || content.trim() === "") {
        return "content must be a non-empty string";
    }

    if (ttl_seconds !== undefined) {
        if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
            return "ttl_seconds must be integer ≥ 1";
        }
    }

    if (max_views !== undefined) {
        if (!Number.isInteger(max_views) || max_views < 1) {
            return "max_views must be integer ≥ 1";
        }
    }

    return null;
}
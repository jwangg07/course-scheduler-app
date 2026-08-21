import rateLimit from "express-rate-limit";

/**
 * General limiter for read endpoints (terms, sections).
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,                // 100 requests per IP per window
    standardHeaders: true,     // adds RateLimit-* headers
    legacyHeaders: false,
});

/**
 * Generous rate limit for cheap fetching terms oepration
 */
export const termsLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict limiter for the bug report endpoint
 */
export const bugReportLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
});
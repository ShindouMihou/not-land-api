import {rateLimiter} from "hono-rate-limiter";
import {Context} from "hono";
import {getConnInfo} from "hono/bun";
import {RouteEnv} from "../types/http";

export const standardRatelimiter = (limitPerMin: number = 25) => rateLimiter({
    windowMs: 60 * 1000, // 1 minutes
    limit: limitPerMin,
    standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    handler: (c) =>{
        return c.json({
            error: `You have exceeded the rate limit of ${limitPerMin} requests per minute. Please try again later.`
        }, {
            status: 429
        });
    },
    keyGenerator: (c: Context<RouteEnv>) => {
        const ipAddress = c.get("ip_address");
        if (ipAddress) {
            return ipAddress;
        }

        const cfConnectingIp = c.req.header('cf-connecting-ip');
        const xForwardedFor = c.req.header('x-forwarded-for');
        return cfConnectingIp || xForwardedFor || c.req.header('remote-addr') || getConnInfo(c).remote.address || 'Unknown IP';
    },
});

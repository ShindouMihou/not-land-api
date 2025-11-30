import { Hono } from 'hono'
import GeoJsonLookup from 'geojson-geometries-lookup';
import getMap from "@geo-maps/earth-seas-1m";
import {netLogger} from "./logger/loggers";
import {cors} from "hono/cors";
import {RouteEnv} from "./types/http";
import {standardRatelimiter} from "./middleware/standardRatelimiter";
import {getConnInfo} from "hono/bun";

const map = getMap();
const lookup = new GeoJsonLookup(map);
const app = new Hono<RouteEnv>()

let requestCounter = 0;
const startupDate = new Date();

app
    .use("*", cors({
        origin: '*',
        allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
        allowHeaders: ['Authorization', 'Content-Type'],
        exposeHeaders: [],
        credentials: true,
        maxAge: 86400, // 24 hours
    }))
    .use("*", async (c, next) => {
        const start = Date.now();
        const cfConnectingIp = c.req.header('cf-connecting-ip');
        const xForwardedFor = c.req.header('x-forwarded-for');
        const remoteIp = cfConnectingIp || xForwardedFor || c.req.header('remote-addr') || getConnInfo(c).remote.address || 'Unknown IP';
        const userAgent = c.req.header('user-agent') || 'Unknown User-Agent';
        const referer = c.req.header('referer') || 'No Referer';

        c.set("ip_address", remoteIp);

        await next();
        const ms = Date.now() - start;
        netLogger.info(`${c.req.method} ${c.req.url} - ${ms}ms (${c.res.status}) from ${remoteIp}, User-Agent: ${userAgent}, Referer: ${referer}`);
    })

// Thanks to the 8-year-old project https://github.com/simonepri/is-sea/tree/master
// Expanded to use 1m resolution data from Natural Earth
app.get(
    '/',
    standardRatelimiter(128),
    (ctx) => {
        requestCounter++;

        const latStr = ctx.req.query('lat');
        const lonStr = ctx.req.query('lon');

        if (!latStr || !lonStr) {
            return ctx.json({ error: 'Missing lat or lon query parameters' }, 400);
        }

        try {
            const lat = parseFloat(latStr);
            const lon = parseFloat(lonStr);
            if (isNaN(lat) || isNaN(lon)) {
                return ctx.json({ error: 'Invalid lat or lon query parameters' }, 400);
            }
            return ctx.json({ areWeInSea: lookup.hasContainers({ type: "Point", coordinates: [lat, lon] })})
        } catch (err) {
            return ctx.json({ error: 'Invalid lat or lon query parameters' }, 400);
        }
    });

app.get("/how-many-requests", (ctx) => {
    return ctx.json({ requests: requestCounter, since: startupDate.toISOString() });
})

export default {
    port: 8372,
    fetch: app.fetch,
    idleTimeout: 60 * 3
}

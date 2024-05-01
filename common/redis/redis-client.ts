import { createClient } from "npm:redis";

const redisClient = await createClient({
    password: Deno.env.get("REDIS_PASSWORD"),
    socket: {
        host: Deno.env.get("REDIS_HOST"),
        port: 19237
    }
}).connect();

export default redisClient;
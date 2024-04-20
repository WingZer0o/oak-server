import { Router } from "https://deno.land/x/oak/mod.ts";
import { PrismaClient } from '../../generated/client/deno/edge.ts'

const prisma = new PrismaClient();
const router = new Router();

router.post("/login", async (context) => {
    
});

export default router;
import { Router } from '../../deps.ts';
import { PrismaClient } from '../../generated/client/deno/edge.ts'
import { LoginDto } from "../../models/user-auth/login-dto.ts";

const prisma = new PrismaClient();
const router = new Router();

router.post("/login", async (context) => {
    const body: LoginDto = await context.request.body.json();
});

export default router;
import { Router } from "https://deno.land/x/oak/mod.ts";
import { LoginDto } from "../../models/user-auth/login-dto.ts";
import { PrismaClient } from '../../generated/client/deno/edge.ts'

const prisma = new PrismaClient();
const router = new Router();

router.post("/register", async (context) => {
    const body: LoginDto = await context.request.body.json();
    await prisma.user.create({
        data: {
          email: body.userName,
          password: body.password
        },
      })
    context.response.body = {};
});

export default router;
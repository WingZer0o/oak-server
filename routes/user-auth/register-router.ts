import { Context, Router } from "https://deno.land/x/oak/mod.ts";
import { PrismaClient } from '../../generated/client/deno/edge.ts'
import { RegisterDto } from "../../models/user-auth/register-dto.ts";

const prisma = new PrismaClient();
const router = new Router();

router.post("/register", async (context) => {
    const body: RegisterDto = await context.request.body.json();
    await prisma.user.create({
        data: {
          email: body.userName,
          password: body.password
        },
      })
    context.response.body = {};
});

export default router;
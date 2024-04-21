import { Router, RouterContext } from "https://deno.land/x/oak/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.3.0/mod.ts";

import { PrismaClient } from '../../generated/client/deno/edge.ts'
import { RegisterDto } from "../../models/user-auth/register-dto.ts";
import { User } from "../../generated/client/index.d.ts";
import { Base400Response } from "../../models/user-auth/400-responses/base-400-response.ts";
import { registerDtoValidation } from "../../common/validation/register-dto-validation.ts";

const prisma = new PrismaClient();
const router = new Router();

router.post("/register", async (context: RouterContext<"/register", Record<string | number, string | undefined>, Record<string, any>>) => {
    const body: RegisterDto = await context.request.body.json();
    const validationResult = registerDtoValidation(body);
    if (!validationResult.isValid) {
      await invalidRequestBody(context, validationResult.message);
    } else {
      const user: User = await prisma.user.findFirst({
        where: {email: body.email}
      });
      if (user) {
        await usersFound(context);
      } else {
        await noUsersFound(context, body);
      }
    }
}); 

const invalidRequestBody = async (context: RouterContext<"/register", Record<string | number, string | undefined>, Record<string, any>>, message: string) => {
  context.response.status = 400;
  context.response.body = new Base400Response(message);
}

const usersFound = async (context: RouterContext<"/register", Record<string | number, string | undefined>, Record<string, any>>) => {
  context.response.status = 400;
  context.response.body = new Base400Response("There was a user account found with this email.");
}

const noUsersFound = async (context: RouterContext<"/register", Record<string | number, string | undefined>, Record<string, any>>, body: RegisterDto) => {
  const hashedPassword: string = await bcrypt.hash(body.password);
  await prisma.user.create({
    data: {
      email: body.email,
      password: hashedPassword
    },
  })
  context.response.status = 200;
}


export default router;
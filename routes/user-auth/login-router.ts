import { JWT } from "../../common/auth/jwt.ts";
import {
  LoginUserDtoValidation,
  loginUserDtoValidation,
} from "../../common/validation/login-dto-validation.ts";
import { bcrypt, Router, RouterContext } from "../../deps.ts";
import { PrismaClient } from "../../generated/client/deno/edge.ts";
import { User } from "../../generated/client/index.d.ts";
import { Base400Response } from "../../models/user-auth/400-responses/base-400-response.ts";
import { LoginDto } from "../../models/user-auth/login-dto.ts";

const prisma = new PrismaClient();
const router = new Router();

router.post(
  "/login",
  async (
    context: RouterContext<
      "/login",
      Record<string | number, string | undefined>,
      Record<string, any>
    >,
  ) => {
    const body: LoginDto = await context.request.body.json();
    const loginValidation: LoginUserDtoValidation = loginUserDtoValidation(
      body.email,
      body.password,
    );
    if (!loginValidation.isValid) {
      return invalidRequestBody(context, loginValidation.message);
    }
    const user: User = await prisma.user.findFirst({
      where: { Email: body.email },
    });
    if (!user) {
      return noUserFound(context);
    }
    const passwordVerified = await bcrypt.compare(
      body.password,
      user.Password,
    );
    if (!passwordVerified) {
      return passwordInvalid(context);
    }
    const jwtHelper = new JWT();
    const jwt: string = await jwtHelper.generateToken(user, 60 * 60);
    context.response.status = 200;
    context.response.body = { token: jwt };
  }
);

const invalidRequestBody = (
  context: RouterContext<
    "/login",
    Record<string | number, string | undefined>,
    Record<string, any>
  >,
  message: string,
) => {
  context.response.status = 400;
  context.response.body = new Base400Response(message);
  return;
};

const noUserFound = (
  context: RouterContext<
    "/login",
    Record<string | number, string | undefined>,
    Record<string, any>
  >,
) => {
  context.response.status = 400;
  context.response.body = new Base400Response(
    "No user was found with that username",
  );
  return;
};

const passwordInvalid = (
  context: RouterContext<
    "/login",
    Record<string | number, string | undefined>,
    Record<string, any>
  >,
) => {
  context.response.status = 400;
  context.response.body = new Base400Response(
    "The password you entered did not match our records",
  );
  return;
};

export default router;

import { decode } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { Context } from "oak";
import { JWT } from "../../common/auth/jwt.ts";

export const jwtRouteValidation = async (ctx: Context, next: any) => {
  try {
    const headers: Headers = ctx.request.headers;
    const token = headers.get("Authorization");
    if (!token) {
      throw new Error("No token provided");
    }
    const jwt = new JWT();
    const decodedToken = decode(token);
    if (!await jwt.verifyToken(token, decodedToken[1]["publicKey"])) {
      throw new Error("Invalid JWT");
    }
    await next();
  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = {
      message: "You are not authorized to access this route",
    };
    return;
  }
};

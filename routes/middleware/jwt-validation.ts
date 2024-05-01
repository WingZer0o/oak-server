import { decode } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { Context } from "oak";
import { JWT } from "../../common/auth/jwt.ts";

export const jwtRouteValidation = async (context: Context, next: any) => {
  try {
    const headers: Headers = context.request.headers;
    const token = headers.get("Authorization");
    if (!token) {
      throw new Error("No token provided");
    }
    const decodedToken = decode(token);
    const publicKey = decodedToken[1]["publicKey"];
    const jwt = new JWT();
    if (!await jwt.verifyToken(token, publicKey)) {
      throw new Error("Invalid JWT");
    }
    await setStateVariablesFromToken(context, decodedToken);
    await next();
  } catch (error) {
    context.response.status = 401;
    context.response.body = {
      message: "You are not authorized to access this route",
    };
    return;
  }
};

const setStateVariablesFromToken = async (context: Context, decodedToken: any) => {
    context.state.userId = decodedToken[1]["userId"];
};
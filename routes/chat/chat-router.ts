import { PrismaClient } from "../../generated/client/deno/edge.ts";
import { Router, RouterContext } from "../../deps.ts";
import { OllamaEmbeddings } from "npm:@langchain/community/embeddings/ollama";
import { SimpleChat } from "../../models/chat/simple-chat.ts";
import { jwtRouteValidation } from "../middleware/jwt-validation.ts";
import { contentRange } from "jsr:@oak/commons@0.9/range";

const prisma = new PrismaClient();
const router = new Router();

router.post("/simple-chat", jwtRouteValidation, async (
    context: RouterContext<
      "/simple-chat",
      Record<string | number, string | undefined>,
      Record<string, any>
    >,
  ) => {
    const testing = await context.request.body.json();
    console.log(testing);
  }
);


export default router;
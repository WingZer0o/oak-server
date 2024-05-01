import { Router } from "https://deno.land/x/oak/mod.ts";
import registerRouter from "./user-auth/register-router.ts";
import loginRouter from "./user-auth/login-router.ts";
import chatRouter from "./chat/chat-router.ts";

const indexRouter = new Router();
indexRouter.use(loginRouter.routes());
indexRouter.use(registerRouter.routes());
indexRouter.use(chatRouter.routes());

export default indexRouter;
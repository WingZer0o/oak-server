import { Router } from "https://deno.land/x/oak/mod.ts";
import loginRouter from "./user-auth/register-router.ts";
import registerRouter from "./user-auth/login-router.ts";

const indexRouter = new Router();
indexRouter.use(loginRouter.routes());
indexRouter.use(registerRouter.routes());

export default indexRouter;
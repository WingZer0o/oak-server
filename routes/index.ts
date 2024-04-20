import { Router } from "https://deno.land/x/oak/mod.ts";
import loginRouter from "./user-auth/login-router.ts";

const indexRouter = new Router();
indexRouter.use(loginRouter.routes());


export default indexRouter;
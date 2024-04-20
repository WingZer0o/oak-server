import { Router } from "https://deno.land/x/oak/mod.ts";
import { LoginDto } from "../../models/user-auth/login-dto.ts";

const router = new Router();

router.post("/login", async (context) => {
    const body: LoginDto = await context.request.body.json();
    context.response.body = {};
});

export default router;
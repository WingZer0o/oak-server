import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import router from "./router-one.ts";

const app = new Application();
app.use(router.routes());

await app.listen({ port: 8080 });
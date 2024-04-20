import { Application } from "https://deno.land/x/oak/mod.ts";
import indexRouter from "./routes/index.ts"; 

const app = new Application();
app.use(indexRouter.routes());

await app.listen({ port: 8080 });
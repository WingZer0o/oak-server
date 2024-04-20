import { Application } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import indexRouter from "./routes/index.ts"; 

const app = new Application();
app.use(oakCors({ origin: "http://localhost:8100" }));
app.use(indexRouter.routes());

await app.listen({ port: 8080 });
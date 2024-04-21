import { Application, oakCors } from "./deps.ts";
import indexRouter from "./routes/index.ts"; 

const app = new Application();
app.use(oakCors({ origin: "http://localhost:8100" }));
app.use(indexRouter.routes());

await app.listen({ port: 8080 });
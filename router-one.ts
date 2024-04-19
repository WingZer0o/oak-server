import { RouteParams, Router } from "https://deno.land/x/oak/mod.ts";
import { AESWrapper } from "npm:cas-typescript-sdk";

const router = new Router();

router.post("/testing", async (context) => {
  const body: TestingBody = await context.request.body.json();
  const aes = new AESWrapper();
  const nonce = aes.aesNonce();
  const key = aes.aes256Key();
  const encoder = new TextEncoder();
  const tohashBytes: Array<number> = Array.from(encoder.encode(body.email));
  const encrypted = aes.aes256Encrypt(key, nonce, tohashBytes);
  const decrypted = aes.aes256Decrypt(key, nonce, encrypted);
  const decoder = new TextDecoder();
  const decoded = decoder.decode(new Uint8Array(decrypted));
  context.response.body = decoded;
});

class TestingBody {
  public email!: string;
}

export default router;

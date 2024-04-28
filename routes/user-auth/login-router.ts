import { Router } from "../../deps.ts";
import { PrismaClient } from "../../generated/client/deno/edge.ts";
import { LoginDto } from "../../models/user-auth/login-dto.ts";
import { create, verify, decode, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const prisma = new PrismaClient();
const router = new Router();

router.post("/login", async (context) => {
  const body: LoginDto = await context.request.body.json();
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 4096,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: "SHA-512",
    },
    true,
    ["sign", "verify"],
  );
  const publicKeyExport = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKey = btoa(String.fromCharCode(...new Uint8Array(publicKeyExport)));
  const jwt = await create({alg: "PS512", typ: "JWT"}, {publicKey: publicKey, exp: getNumericDate(1)}, keyPair.privateKey);
  const [header, payload, signature] = decode(jwt);
  const publicKeyBuffer = Uint8Array.from(atob(payload['publicKey']), c => c.charCodeAt(0));
  const importedPublicKey = await crypto.subtle.importKey(
    "spki",
    publicKeyBuffer,
    {
        name: "RSA-PSS",
        hash: "SHA-512",
    },
    true,
    ["verify"]
);
// todo: abstract this logic and make it appropriate for login.
setTimeout(async () => {
    const payload2 = await verify(jwt, importedPublicKey);
    console.log(payload2);

}, 1000 * 60)
});

export default router;

import {
  create,
  getNumericDate,
  verify,
} from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { User } from "../../generated/client/index.d.ts";

export class JWT {
  async generateToken(user: User, secondsToAddToExp: number): Promise<string> {
    const keyPair: CryptoKeyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-PSS",
        modulusLength: 4096,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-512",
      },
      true,
      ["sign", "verify"],
    );
    const publicKeyExport = await crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey,
    );
    const publicKeyBase64 = btoa(
      String.fromCharCode(...new Uint8Array(publicKeyExport)),
    );
    const jwt = await create({ alg: "PS512", typ: "JWT" }, {
      userId: user.id,
      publicKey: publicKeyBase64,
      exp: getNumericDate(secondsToAddToExp),
    }, keyPair.privateKey);
    return jwt;
  }

  async verifyToken(token: string, publicKey: string): Promise<boolean> {
    try {
      const key = await crypto.subtle.importKey(
        "spki",
        new Uint8Array(atob(publicKey).split("").map((c) => c.charCodeAt(0))),
        {
          name: "RSA-PSS",
          hash: "SHA-512",
        },
        true,
        ["verify"],
      );
      // throws error if invalid
      const jwt = await verify(token, key);
      return true;
    } catch (error) {
      return false;
    }
  }
}

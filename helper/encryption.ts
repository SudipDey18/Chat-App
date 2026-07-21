import { generateKeyPairSync } from "react-native-quick-crypto";

export async function generateKeyPair() {
  try {
    const { publicKey, privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });

    console.log("✅ Keys generated successfully");

    return {
      publicKey,
      privateKey,
    };
  } catch (error) {
    console.error("❌ Key generation failed:", error);
    throw error;
  }
}

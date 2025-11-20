import CryptoJS from "crypto-js";

const SECRET_KEY = (import.meta.env.VITE_SECRET_KEY );
const SECRET_IV = (import.meta.env.VITE_SECRET_IV );

const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
const iv = CryptoJS.enc.Utf8.parse(SECRET_IV);

export const encryptPayload = (payload) => {
  try {
    const payloadString = typeof payload === "string" ? payload : JSON.stringify(payload);

    const encrypted = CryptoJS.AES.encrypt(payloadString, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7, 
    });

    return encrypted.toString(); 
  } catch (err) {
    console.error("Encryption error:", err);
    return null;
  }
};

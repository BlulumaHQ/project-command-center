// Face ID / Touch ID login via Supabase passkeys (WebAuthn). Browser-only.
import { supabase } from "@/lib/supabase";

const FLAG = "hq_passkey_ready";

export function passkeySupported() {
  // Passkeys are bound to bluluma.com, so only offer Face ID on *.bluluma.com (not on preview URLs).
  return typeof window !== "undefined" && typeof window.PublicKeyCredential === "function" && /(^|\.)bluluma\.com$/.test(window.location.hostname);
}

/** Remembered per device: this phone already registered a passkey. */
export function passkeyRemembered() {
  try {
    return window.localStorage.getItem(FLAG) === "1";
  } catch {
    return false;
  }
}

function remember() {
  try {
    window.localStorage.setItem(FLAG, "1");
  } catch {
    /* private mode: the button still works, it just isn't promoted */
  }
}

export async function signInWithFaceId() {
  const { error } = await supabase.auth.signInWithPasskey();
  if (error) throw new Error(friendly(error.message));
  remember();
}

export async function registerFaceId() {
  const { error } = await supabase.auth.registerPasskey();
  if (error) throw new Error(friendly(error.message));
  remember();
}

function friendly(message: string) {
  if (/abort|cancel|NotAllowed/i.test(message)) return "已取消 Face ID";
  if (/not enabled|disabled|passkey.*not/i.test(message)) return "伺服器還沒開啟 Face ID 登入";
  return message;
}

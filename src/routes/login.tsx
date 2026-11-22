import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { passkeyRemembered, passkeySupported, signInWithFaceId } from "@/lib/passkey";
import { ScanFace } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({ meta: [
    { title: "登入 · Bluluma HQ" },
    { name: "description", content: "登入 Sony 的私人專案總控台。" },
    { property: "og:title", content: "登入 · Bluluma HQ" },
    { property: "og:description", content: "登入 Sony 的私人專案總控台。" },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Login,
});

function Login() {
  const [email, setEmail] = useState("sony@bluluma.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (ready && user) void navigate({ to: "/", replace: true }); }, [ready, user, navigate]);
  const [faceId, setFaceId] = useState(false);
  const [faceFirst, setFaceFirst] = useState(false);
  useEffect(() => { setFaceId(passkeySupported()); setFaceFirst(passkeyRemembered()); }, []);
  async function faceLogin() {
    setPending(true); setError("");
    try { await signInWithFaceId(); await navigate({ to: "/", replace: true }); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Face ID 登入失敗"); }
    finally { setPending(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setError("");
    try {
      const { error: failure } = await supabase.auth.signInWithPassword({ email, password });
      if (failure) throw failure;
      setPassword("");
      await navigate({ to: "/", replace: true });
    } catch (failure) { setError(failure instanceof Error ? failure.message : "登入失敗，請再試一次。"); }
    finally { setPending(false); }
  }
  return <div className="mx-auto flex min-h-[65vh] max-w-sm flex-col justify-center py-12">
    {logoFailed ? <span className="font-bold">BLULUMA DESIGN</span> : <img src="/images/bluluma-logo.svg" alt="Bluluma Design" className="mb-8 h-14 w-auto self-start" onError={() => setLogoFailed(true)} />}
    <h1 className="text-2xl font-bold">Bluluma HQ</h1>
    {faceId && <div className="mt-8 space-y-2">
      <Button type="button" onClick={faceLogin} disabled={pending} variant={faceFirst ? "default" : "outline"} className="h-14 w-full text-base">
        <ScanFace className="mr-2 h-5 w-5" />用 Face ID 登入
      </Button>
      {!faceFirst && <p className="text-xs text-muted-foreground">第一次請先用密碼登入，再到「更多」→「設定 Face ID」。</p>}
    </div>}
    <form onSubmit={submit} className="mt-8 space-y-5">
      <label className="block space-y-2 text-sm font-medium"><span>Email</span><Input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label className="block space-y-2 text-sm font-medium"><span>密碼</span><Input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      {error && <p role="alert" className="break-words text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending} className="h-11 w-full">{pending ? "登入中…" : "登入"}</Button>
    </form>
  </div>;
}
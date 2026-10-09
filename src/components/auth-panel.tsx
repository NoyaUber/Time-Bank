"use client";

import { FormEvent, useState } from "react";
import { Sprout, Coins, Clock3 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AuthPanel() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const supabase = createClient();
      const result = mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) throw result.error;
      if (mode === "signup" && !result.data.session) {
        setMessage("Akun dibuat. Periksa email untuk konfirmasi, lalu masuk.");
      } else {
        window.location.reload();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark"><Sprout size={28} /></div>
        <p className="eyebrow">YOUR TIME, YOUR WORLD</p>
        <h1>Selamat datang di <span>TimeBank</span></h1>
        <p className="muted">Kumpulkan waktu. Tanam kehidupan. Bangun duniamu.</p>
        <div className="feature-strip">
          <div><Coins size={18}/><span>1 koin/menit</span></div>
          <div><Clock3 size={18}/><span>Maks. 12 jam</span></div>
        </div>
        <div className="tabs">
          <button className={mode === "signup" ? "tab active" : "tab"} onClick={() => setMode("signup")} type="button">Daftar</button>
          <button className={mode === "login" ? "tab active" : "tab"} onClick={() => setMode("login")} type="button">Masuk</button>
        </div>
        <form onSubmit={submit} className="auth-form">
          <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" autoComplete="email" required /></label>
          <label>Kata sandi<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 8 karakter" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={8} required /></label>
          <button className="primary-button" type="submit" disabled={busy}>{busy ? "Memproses..." : mode === "signup" ? "Buat akun" : "Masuk ke TimeBank"}</button>
        </form>
        {message && <p className="notice" role="status">{message}</p>}
        <p className="fine-print">Versi awal · Progres tersimpan di akunmu setelah Supabase dikonfigurasi.</p>
      </section>
    </main>
  );
}

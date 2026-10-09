"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Clock3, Coins, Sprout, Trophy, Users, PawPrint, LogOut, Sparkles, Leaf } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  email: string;
  username: string;
  balance: number;
  lastClaimAt: string;
  setupError: boolean;
};

const CAP_SECONDS = 12 * 60 * 60;

function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours} jam ${minutes} menit`;
}

export default function Dashboard({ email, username, balance, lastClaimAt, setupError }: Props) {
  const [now, setNow] = useState(Date.now());
  const [currentBalance, setCurrentBalance] = useState(balance);
  const [claiming, setClaiming] = useState(false);
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState("Home");

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const elapsed = Math.max(0, Math.floor((now - new Date(lastClaimAt).getTime()) / 1000));
  const cappedElapsed = Math.min(elapsed, CAP_SECONDS);
  const reward = Math.floor(cappedElapsed / 60);
  const progress = Math.min(100, (cappedElapsed / CAP_SECONDS) * 100);
  const remaining = Math.max(0, CAP_SECONDS - cappedElapsed);

  const greeting = useMemo(() => {
    const hour = new Date(now).getHours();
    return hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";
  }, [now]);

  async function claimCoins() {
    setClaiming(true);
    setNotice("");
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("claim_offline_coins");
      if (error) throw error;
      const result = Array.isArray(data) ? data[0] : data;
      if (!result) throw new Error("Server tidak mengembalikan hasil klaim.");
      setCurrentBalance(Number(result.new_balance));
      setNotice(Number(result.coins_awarded) > 0
        ? `Berhasil mengklaim ${result.coins_awarded} koin.`
        : "Belum ada koin baru. Kembali setelah satu menit offline.");
      window.location.reload();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Klaim gagal. Coba lagi.");
    } finally {
      setClaiming(false);
    }
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-icon"><Sprout size={22}/></span><span>Time<span className="brand-accent">Bank</span></span></a>
        <div className="top-actions">
          <div className="balance-pill"><Coins size={17}/><strong>{currentBalance.toLocaleString("id-ID")}</strong></div>
          <button className="icon-button" aria-label="Keluar" onClick={signOut}><LogOut size={18}/></button>
        </div>
      </header>

      {setupError && <div className="setup-warning">Database belum siap atau data pemain belum dibuat. Ikuti petunjuk SETUP.md untuk menjalankan migrasi Supabase.</div>}

      <section className="welcome-row">
        <div><p className="eyebrow">YOUR LITTLE WORLD</p><h1>{greeting}, {username}!</h1><p className="muted">Waktumu berkembang menjadi sesuatu yang berarti.</p></div>
        <div className="avatar-pixel" aria-hidden="true">🌱</div>
      </section>

      <section className="vault-card">
        <div className="vault-top"><div className="section-icon gold"><Clock3 size={20}/></div><div className="vault-heading"><span className="muted small">TIME VAULT</span><h2>Bank Waktu</h2></div><span className="status-chip">{reward > 0 ? "SIAP DIKLAIM" : "MENGUMPULKAN"}</span></div>
        <div className="reward-row"><div><strong className="reward-number">+{reward.toLocaleString("id-ID")}</strong><span className="reward-label"> koin tersedia</span></div><div className="coin-orbit"><Coins size={25}/></div></div>
        <div className="progress-meta"><span>{formatDuration(cappedElapsed)} terkumpul</span><span>12 jam</span></div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }}/></div>
        <div className="vault-footer"><span>{remaining > 0 ? `${formatDuration(remaining)} menuju kapasitas penuh` : "Kapasitas penuh — klaim untuk memulai periode berikutnya"}</span><button className="primary-button claim-button" disabled={claiming || reward < 1 || setupError} onClick={claimCoins}>{claiming ? "Mengklaim..." : "Klaim koin"}</button></div>
        {notice && <p className="notice" role="status">{notice}</p>}
      </section>

      <section className="world-section">
        <div className="section-heading"><div><p className="eyebrow">YOUR PROGRESS</p><h2>Duniamu</h2></div><span className="level-pill"><Sparkles size={14}/> Level 1</span></div>
        <div className="world-card">
          <div className="world-art" role="img" aria-label="Ilustrasi kota pixel art">
            <div className="sun"></div><div className="cloud cloud-one"></div><div className="cloud cloud-two"></div>
            <div className="mountain mountain-back"></div><div className="mountain mountain-front"></div>
            <div className="pixel-tree tree-one"><i></i></div><div className="pixel-tree tree-two"><i></i></div><div className="pixel-tree tree-three"><i></i></div>
            <div className="river"></div><div className="path"></div>
            <div className="pixel-house house-one"><i></i><b></b></div><div className="pixel-house house-two"><i></i><b></b></div><div className="pixel-house house-three"><i></i><b></b></div>
            <div className="world-label"><span>🌿</span><div><strong>Meadow Haven</strong><small>Kota kecilmu baru dimulai</small></div></div>
          </div>
          <div className="world-stats"><div><Sprout size={17}/><span><strong>0</strong><small>Pohon</small></span></div><div><Building2 size={17}/><span><strong>0</strong><small>Bangunan</small></span></div><div><PawPrint size={17}/><span><strong>0</strong><small>Teman kecil</small></span></div></div>
        </div>
      </section>

      <section className="quick-grid">
        <button className="feature-card" onClick={() => setTab("Garden")}><span className="feature-icon green"><Leaf size={21}/></span><strong>Time Garden</strong><small>Tanam pohon pertamamu</small><span className="card-arrow">↗</span></button>
        <button className="feature-card" onClick={() => setTab("City")}><span className="feature-icon blue"><Building2 size={21}/></span><strong>Time City</strong><small>Bangun kota impian</small><span className="card-arrow">↗</span></button>
        <button className="feature-card" onClick={() => setTab("Pets")}><span className="feature-icon pink"><PawPrint size={21}/></span><strong>Companions</strong><small>Kumpulkan hewan</small><span className="card-arrow">↗</span></button>
        <button className="feature-card" onClick={() => setTab("Goals")}><span className="feature-icon gold"><Trophy size={21}/></span><strong>Achievements</strong><small>Capai tujuan kecil</small><span className="card-arrow">↗</span></button>
      </section>

      {tab !== "Home" && <div className="coming-soon"><Sparkles size={18}/><div><strong>{tab} segera hadir</strong><p>Fondasi Time Vault sedang disiapkan terlebih dahulu. Progres fitur ini akan ditambahkan pada fase berikutnya.</p></div><button onClick={() => setTab("Home")}>Kembali</button></div>}

      <footer className="footer"><span>© TimeBank · Build your world, one minute at a time.</span><span>{email}</span></footer>
      <nav className="bottom-nav" aria-label="Navigasi utama">
        {[["Home",Sprout],["Garden",Leaf],["City",Building2],["Goals",Trophy],["Social",Users]].map(([label, Icon]: any) => <button key={label} className={tab === label ? "nav-item selected" : "nav-item"} onClick={() => setTab(label)}><Icon size={19}/><span>{label}</span></button>)}
      </nav>
    </main>
  );
}

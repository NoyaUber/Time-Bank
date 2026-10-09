import { createClient } from "@/lib/supabase/server";
import Dashboard from "@/components/dashboard";
import AuthPanel from "@/components/auth-panel";

export default async function Home() {
  let user = null;
  let profile = null;
  let state = null;
  let setupError = false;

  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    user = auth.user;

    if (user) {
      const [profileResult, stateResult] = await Promise.all([
        supabase.from("profiles").select("username, display_name").eq("id", user.id).maybeSingle(),
        supabase.from("player_states").select("coin_balance, last_claim_at").eq("user_id", user.id).maybeSingle(),
      ]);
      profile = profileResult.data;
      state = stateResult.data;
      setupError = Boolean(profileResult.error || stateResult.error || !state);
    }
  } catch {
    setupError = true;
  }

  if (!user) return <AuthPanel />;
  return (
    <Dashboard
      email={user.email ?? ""}
      username={profile?.display_name || profile?.username || user.email?.split("@")[0] || "Pemain"}
      balance={Number(state?.coin_balance ?? 0)}
      lastClaimAt={state?.last_claim_at ?? new Date().toISOString()}
      setupError={setupError}
    />
  );
}

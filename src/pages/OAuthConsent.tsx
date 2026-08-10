import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};

const oauth = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

const OAuthConsent = () => {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/?next=" + encodeURIComponent(next);
        return;
      }
      setEmail(sess.session.user.email ?? "");
      const { data, error: detailsError } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (detailsError) {
        setError(detailsError.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  const decide = async (approve: boolean) => {
    setBusy(true);
    const { data, error: decideError } = approve
      ? await oauth().approveAuthorization(authorizationId)
      : await oauth().denyAuthorization(authorizationId);
    if (decideError) {
      setBusy(false);
      setError(decideError.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  };

  const clientName = details?.client?.name ?? "this app";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-elevated">
        <div className="mb-4 flex items-center gap-2 text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span className="text-xs font-medium">Secure authorization</span>
        </div>

        {error ? (
          <p className="text-sm text-alert">Could not load this authorization request: {error}</p>
        ) : !details ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <h1 className="text-xl font-bold text-foreground">
              Connect {clientName} to HemaLen AI
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This lets {clientName} use HemaLen AI as you — reading your hemoglobin scan history and
              recording new readings.
            </p>
            <div className="mt-4 space-y-1 rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
              {email && <p>Signed in as <span className="font-medium text-foreground">{email}</span></p>}
              {details?.client?.redirect_uri && <p className="break-all">Redirects to {details.client.redirect_uri}</p>}
              {details?.scope && <p>Requested access: {details.scope}</p>}
              <p>This does not bypass this app's permissions or backend policies.</p>
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <Button variant="clinical" size="lg" disabled={busy} onClick={() => decide(true)}>
                Approve
              </Button>
              <Button variant="outline" size="lg" disabled={busy} onClick={() => decide(false)}>
                Cancel connection
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default OAuthConsent;

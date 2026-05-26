import { FormEvent, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

function getErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
        return "Invalid email or password.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      default:
        return error.message || "Sign in failed. Please try again.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Sign in failed. Please try again.";
}

const requiredFirebaseEnv = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

export default function SignInPage() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const missingEnvVars = useMemo(() => requiredFirebaseEnv.filter((key) => !import.meta.env[key]), []);
  const signupSuccess = (location.state as { signupSuccess?: string } | null)?.signupSuccess;

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signIn(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#e0f2fe_0%,#f8fafc_45%,#ffffff_100%)] p-4">
      <div className="pointer-events-none absolute -top-24 -left-28 h-72 w-72 rounded-full bg-cyan-200/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center">
        <Card className="grid w-full overflow-hidden border-slate-200/70 bg-white/90 shadow-2xl backdrop-blur md:grid-cols-2">
          <section className="hidden bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 p-10 text-white md:block">
            <div className="mb-16 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              Budget Buddy
            </div>
            <h1 className="max-w-sm text-4xl font-bold leading-tight">Take control of every rupee.</h1>
            <p className="mt-4 max-w-sm text-sm text-slate-200">
              Sign in to continue tracking expenses, budget targets, and savings goals in one secure workspace.
            </p>
            <div className="mt-10 space-y-4 text-sm text-slate-100/90">
              <p className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-cyan-300" />
                Fast entries for income and expenses
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Protected with Firebase Authentication
              </p>
            </div>
          </section>

          <CardContent className="p-6 sm:p-10">
            <div className="mx-auto w-full max-w-md space-y-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-700">Welcome Back</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                  Sign in to your account
                </h2>
              </div>

              {missingEnvVars.length > 0 && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  Missing Firebase env vars: {missingEnvVars.join(", ")}
                </div>
              )}
              {signupSuccess && (
                <div className="rounded-md border border-emerald-300/50 bg-emerald-50 p-3 text-sm text-emerald-700">
                  {signupSuccess}
                </div>
              )}

              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                    className="h-11"
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button
                  type="submit"
                  className="h-11 w-full bg-cyan-700 text-white hover:bg-cyan-800"
                  disabled={submitting || missingEnvVars.length > 0}
                >
                  {submitting ? "Please wait..." : "Sign in"}
                </Button>
              </form>

              <p className="text-center text-sm text-slate-600">
                New here?{" "}
                <Link to="/sign-up" className="font-medium text-cyan-700 hover:text-cyan-800">
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

interface LoginForm {
  email: string;
  password: string;
}

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm<LoginForm>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session) return <Navigate to="/admin" replace />;

  const onSubmit = async ({ email, password }: LoginForm) => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    // If signIn returns a session immediately, navigate right away.
    if (data?.session) {
      navigate("/admin");
      setLoading(false);
      return;
    }

    // Otherwise wait for onAuthStateChange to provide the session (avoids race where session isn't available yet).
    try {
      await new Promise<void>((resolve) => {
        const { data: sub } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            if (session) {
              sub.subscription.unsubscribe();
              resolve();
            }
          },
        );
      });
      navigate("/admin");
    } catch {
      setError("로그인 처리 중 오류가 발생했습니다. 다시 시도하세요.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* ─ 브랜드 영역 ─ */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-light text-white tracking-widest">
            The Lit
          </h1>
          <p className="font-sans text-[10px] text-white/30 tracking-wider uppercase mt-2">
            Admin
          </p>
          <p className="font-sans text-[10px] text-white/20 tracking-wide mt-4">
            공간과 콘텐츠 운영을 위한 관리자 시스템
          </p>
        </div>

        {/* ─ 폼 패널 ─ */}
        <div className="border border-white/10 bg-white/[0.02] px-8 py-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="login-email"
                className="block text-[10px] font-sans font-medium tracking-wider uppercase text-white/40 mb-2"
              >
                Email
              </label>
              <input
                id="login-email"
                {...register("email")}
                type="email"
                autoComplete="email"
                required
                className="w-full px-0 py-3 bg-transparent border-b border-white/20 text-white placeholder:text-white/25 focus:border-brand-accent focus:outline-none font-sans text-sm transition-colors [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#0A0A0A] [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[caret-color:white]"
                placeholder="litadmin@naver.com"
              />
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="block text-[10px] font-sans font-medium tracking-wider uppercase text-white/40 mb-2"
              >
                Password
              </label>
              <input
                id="login-password"
                {...register("password")}
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-0 py-3 bg-transparent border-b border-white/20 text-white placeholder:text-white/25 focus:border-brand-accent focus:outline-none font-sans text-sm transition-colors [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#0A0A0A] [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[caret-color:white]"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="border-l-2 border-red-400 pl-3 py-0.5">
                <p className="text-red-400/80 text-xs font-sans">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-brand-black font-sans text-xs font-medium tracking-widest uppercase transition-all hover:bg-brand-accent hover:text-white disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Signing In</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

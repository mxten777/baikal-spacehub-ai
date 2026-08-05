import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface LoginForm {
  email: string;
  password: string;
}

export default function AdminLoginPage() {
  const { user, role, profileLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit } = useForm<LoginForm>();

  // 로그인 성공 후 프로필 조회 완료 시: role 없으면 로컬 로그아웃 + 에러 표시
  useEffect(() => {
    if (user && !profileLoading && role === null) {
      supabase.auth
        .signOut({ scope: "local" })
        .catch(() => {})
        .finally(() => {
          setLoading(false);
          setError("관리자 권한이 없는 계정입니다. 담당자에게 문의하세요.");
        });
    }
  }, [user, profileLoading, role]);

  if (user && role !== null) return <Navigate to="/admin" replace />;

  const onSubmit = async ({ email, password }: LoginForm) => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        setLoading(false);
        return;
      }
      // 성공 시 loading=true 유지 — profile 로딩 후 redirect(컴포넌트 언마운트)로 자연 해제
      // 버튼이 "Sign In"으로 되돌아가는 UX 깜빡임 방지
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도하세요.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* ─ 브랜드 영역 ─ */}
        <div className="text-center mb-10">
          <img
            src="/images/thelitlogo_red_trans.png"
            alt="THE LIT"
            className="h-24 w-auto mx-auto mb-6"
          />
          <p className="font-sans text-sm text-brand-accent/90 tracking-[0.2em] uppercase mb-4">
            Admin Portal
          </p>
          <p className="font-display text-3xl font-light text-white/80 tracking-wide">
            Welcome back
          </p>
          <p className="font-sans text-sm text-white/40 tracking-wide mt-3">
            공간과 콘텐츠 운영을 위한 관리자 시스템
          </p>
        </div>

        {/* ─ 폼 패널 ─ */}
        <div className="border border-white/10 bg-white/[0.03] px-10 py-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-sans font-semibold tracking-[0.15em] uppercase text-white/60 mb-3"
              >
                Email
              </label>
              <input
                id="login-email"
                {...register("email")}
                type="email"
                autoComplete="email"
                required
                className="w-full px-0 py-4 bg-transparent border-b border-white/20 text-white text-lg placeholder:text-white/25 focus:border-brand-accent focus:outline-none font-sans transition-colors [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#0A0A0A] [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[caret-color:white]"
                placeholder="admin@thelitspace.com"
              />
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-sans font-semibold tracking-[0.15em] uppercase text-white/60 mb-3"
              >
                Password
              </label>
              <input
                id="login-password"
                {...register("password")}
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-0 py-4 bg-transparent border-b border-white/20 text-white text-lg placeholder:text-white/25 focus:border-brand-accent focus:outline-none font-sans transition-colors [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#0A0A0A] [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[caret-color:white]"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="border-l-2 border-red-400 pl-3 py-1">
                <p className="text-red-400/80 text-xs font-sans">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 mt-2 bg-white text-brand-black font-sans text-base font-semibold tracking-[0.15em] uppercase transition-all hover:bg-brand-accent hover:text-white disabled:opacity-50 flex items-center justify-center gap-2"
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

        <p className="text-center text-white/25 text-xs font-sans tracking-wider mt-8">
          © 2024 THE LIT. All rights reserved.
        </p>
      </div>
    </div>
  );
}

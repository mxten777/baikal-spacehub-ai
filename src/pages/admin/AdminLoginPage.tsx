import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useForm } from 'react-hook-form'
import type { Session } from '@supabase/supabase-js'

interface LoginForm {
  email: string
  password: string
}

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const navigate = useNavigate()

  const { register, handleSubmit } = useForm<LoginForm>()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session) return <Navigate to="/admin" replace />

  const onSubmit = async ({ email, password }: LoginForm) => {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
      return
    }

    // If signIn returns a session immediately, navigate right away.
    if (data?.session) {
      navigate('/admin')
      setLoading(false)
      return
    }

    // Otherwise wait for onAuthStateChange to provide the session (avoids race where session isn't available yet).
    try {
      await new Promise<void>((resolve) => {
        const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            sub.subscription.unsubscribe()
            resolve()
          }
        })
      })
      navigate('/admin')
    } catch {
      setError('로그인 처리 중 오류가 발생했습니다. 다시 시도하세요.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-display text-2xl font-light text-white tracking-widest">The Lit</h1>
          <p className="font-sans text-xs text-white/40 tracking-widest uppercase mt-2">Admin</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-xs font-sans font-medium tracking-widest uppercase text-white/40 mb-2">Email</label>
            <input
              {...register('email')}
              type="email"
              required
              className="w-full px-0 py-3 bg-transparent border-b border-white/20 text-white placeholder:text-white/30 focus:border-white focus:outline-none font-sans text-sm"
              placeholder="admin@thelit.kr"
            />
          </div>
          <div>
            <label className="block text-xs font-sans font-medium tracking-widest uppercase text-white/40 mb-2">Password</label>
            <input
              {...register('password')}
              type="password"
              required
              className="w-full px-0 py-3 bg-transparent border-b border-white/20 text-white placeholder:text-white/30 focus:border-white focus:outline-none font-sans text-sm"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm font-sans">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-brand-black font-sans text-sm font-medium tracking-widest uppercase transition-all hover:bg-brand-accent hover:text-white disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

import { useState, type FormEvent } from 'react'
import { useAuth } from '../../contexts/AuthContext'

type AuthFormProps = {
  mode: 'login' | 'signup'
  onAuthenticated: () => void
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export function AuthForm({ mode, onAuthenticated }: AuthFormProps) {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 입력해 주세요.')
      return
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('비밀번호는 6자 이상으로 설정해 주세요.')
        return
      }
      if (password !== confirm) {
        setError('비밀번호 확인이 일치하지 않습니다.')
        return
      }
    }

    setSubmitting(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
      onAuthenticated()
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'login' ? '로그인' : '회원가입'

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-orbit-border bg-orbit-surface/80 p-8 shadow-xl shadow-black/30 backdrop-blur-sm"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">{title}</h1>
      </div>

      {error ? (
        <p
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="auth-email" className="text-sm font-medium text-zinc-100">
          이메일
        </label>
        <input
          id="auth-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          className="w-full rounded-xl border border-orbit-border bg-orbit-bg/80 px-4 py-3 text-sm text-zinc-100 outline-none ring-orbit-accent/40 transition placeholder:text-orbit-muted focus:border-orbit-accent focus:ring-2"
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="auth-password" className="text-sm font-medium text-zinc-100">
          비밀번호
        </label>
        <input
          id="auth-password"
          name="password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          className="w-full rounded-xl border border-orbit-border bg-orbit-bg/80 px-4 py-3 text-sm text-zinc-100 outline-none ring-orbit-accent/40 transition placeholder:text-orbit-muted focus:border-orbit-accent focus:ring-2"
          placeholder="••••••••"
          required
        />
      </div>

      {mode === 'signup' ? (
        <div className="space-y-1.5">
          <label htmlFor="auth-confirm" className="text-sm font-medium text-zinc-100">
            비밀번호 확인
          </label>
          <input
            id="auth-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(ev) => setConfirm(ev.target.value)}
            className="w-full rounded-xl border border-orbit-border bg-orbit-bg/80 px-4 py-3 text-sm text-zinc-100 outline-none ring-orbit-accent/40 transition placeholder:text-orbit-muted focus:border-orbit-accent focus:ring-2"
            placeholder="••••••••"
          />
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-orbit-accent py-3 text-sm font-semibold text-white shadow-lg shadow-orbit-accent/25 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-orbit-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orbit-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? <Spinner /> : null}
        {submitting ? '처리 중…' : mode === 'login' ? '로그인하기' : '가입 완료하기'}
      </button>
    </form>
  )
}

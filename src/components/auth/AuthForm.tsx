import { useState, type FormEvent } from 'react'

type AuthFormProps = {
  mode: 'login' | 'signup'
  onAuthenticated: () => void
}

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5 shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  )
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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
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

    onAuthenticated()
  }

  const handleGoogleLogin = () => {
    setGoogleLoading(true)
    setTimeout(() => {
      onAuthenticated()
    }, 1500)
  }

  const title = mode === 'login' ? '로그인' : '회원가입'

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-orbit-border bg-orbit-surface/80 p-8 shadow-xl shadow-black/30 backdrop-blur-sm"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
      </div>

      {/* Google 로그인 버튼 */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-orbit-border bg-white/5 py-3 text-sm font-medium text-zinc-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {googleLoading ? <Spinner /> : <GoogleIcon />}
        <span>{googleLoading ? 'Google 계정 확인 중...' : 'Google로 계속하기'}</span>
      </button>

      {/* 구분선 */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-orbit-border" />
        <span className="text-xs text-zinc-500">또는 이메일로 계속하기</span>
        <div className="h-px flex-1 bg-orbit-border" />
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
        <label htmlFor="auth-email" className="text-sm font-medium text-zinc-200">
          이메일
        </label>
        <input
          id="auth-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          className="w-full rounded-xl border border-orbit-border bg-orbit-bg/80 px-4 py-3 text-sm text-zinc-100 outline-none ring-orbit-accent/40 transition placeholder:text-zinc-600 focus:border-orbit-accent focus:ring-2"
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="auth-password" className="text-sm font-medium text-zinc-200">
          비밀번호
        </label>
        <input
          id="auth-password"
          name="password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          className="w-full rounded-xl border border-orbit-border bg-orbit-bg/80 px-4 py-3 text-sm text-zinc-100 outline-none ring-orbit-accent/40 transition placeholder:text-zinc-600 focus:border-orbit-accent focus:ring-2"
          placeholder="••••••••"
        />
      </div>

      {mode === 'signup' ? (
        <div className="space-y-1.5">
          <label htmlFor="auth-confirm" className="text-sm font-medium text-zinc-200">
            비밀번호 확인
          </label>
          <input
            id="auth-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(ev) => setConfirm(ev.target.value)}
            className="w-full rounded-xl border border-orbit-border bg-orbit-bg/80 px-4 py-3 text-sm text-zinc-100 outline-none ring-orbit-accent/40 transition placeholder:text-zinc-600 focus:border-orbit-accent focus:ring-2"
            placeholder="••••••••"
          />
        </div>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-full bg-orbit-accent py-3 text-sm font-semibold text-white shadow-lg shadow-orbit-accent/25 transition hover:bg-orbit-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orbit-accent"
      >
        {mode === 'login' ? '로그인하기' : '가입 완료하기'}
      </button>
    </form>
  )
}

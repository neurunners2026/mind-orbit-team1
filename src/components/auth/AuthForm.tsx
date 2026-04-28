import { useState, type FormEvent } from 'react'

type AuthFormProps = {
  mode: 'login' | 'signup'
  onAuthenticated: () => void
}

export function AuthForm({ mode, onAuthenticated }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

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

  const title = mode === 'login' ? '로그인' : '회원가입'
  const subtitle =
    mode === 'login'
      ? '데모: 서버 검증 없이 세션만 표시합니다.'
      : '데모: 실제 계정은 생성되지 않습니다.'

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-orbit-border bg-orbit-surface/80 p-8 shadow-xl shadow-black/30 backdrop-blur-sm"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
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

import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/landing/Navbar'
import { AuthForm } from '../components/auth/AuthForm'
import { useAuth } from '../contexts/AuthContext'

type LocationState = {
  from?: { pathname: string }
  signupComplete?: boolean
}

export default function Login() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const from = state?.from?.pathname ?? '/dashboard'
  const signupComplete = state?.signupComplete === true

  if (loading) return null

  if (session) {
    return <Navigate to={from} replace />
  }

  const handleAuthenticated = () => {
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-dvh bg-orbit-bg">
      <Navbar showSectionNav={false} showClose />
      <main className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-lg flex-col justify-center px-4 py-16 sm:px-6">
        {signupComplete ? (
          <p
            className="mb-6 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-100"
            role="status"
          >
            회원가입이 완료되었습니다. 로그인해주세요.
          </p>
        ) : null}
        <AuthForm mode="login" onAuthenticated={handleAuthenticated} />
        <p className="mt-8 text-center text-sm text-zinc-500">
          계정이 없으신가요?{' '}
          <Link
            to="/signup"
            state={location.state}
            className="font-medium text-violet-300 underline-offset-4 hover:text-violet-200 hover:underline"
          >
            회원가입
          </Link>
        </p>
      </main>
    </div>
  )
}

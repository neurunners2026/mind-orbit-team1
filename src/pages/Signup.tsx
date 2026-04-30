import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { Navbar } from '../components/landing/Navbar'
import { AuthForm } from '../components/auth/AuthForm'
import { useAuth } from '../contexts/AuthContext'

type LocationState = {
  from?: { pathname: string }
}

export default function Signup() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    (location.state as LocationState | null)?.from?.pathname ?? '/dashboard'

  if (loading) return null

  if (session) {
    return <Navigate to={from} replace />
  }

  const handleSignupSuccess = () => {
    const prior = location.state as LocationState | null
    navigate('/login', {
      replace: true,
      state: {
        from: prior?.from,
        signupComplete: true,
      },
    })
  }

  return (
    <div className="min-h-dvh bg-orbit-bg">
      <Navbar showSectionNav={false} showClose />
      <main className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-lg flex-col justify-center px-4 py-16 sm:px-6">
        <AuthForm mode="signup" onAuthenticated={handleSignupSuccess} />
        <p className="mt-8 text-center text-sm text-zinc-500">
          이미 계정이 있나요?{' '}
          <Link
            to="/login"
            state={location.state}
            className="font-medium text-violet-300 underline-offset-4 hover:text-violet-200 hover:underline"
          >
            로그인
          </Link>
        </p>
      </main>
    </div>
  )
}

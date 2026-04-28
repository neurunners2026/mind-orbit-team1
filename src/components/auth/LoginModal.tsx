import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { AuthForm } from './AuthForm'

type LoginModalProps = {
  onClose: () => void
}

export function LoginModal({ onClose }: LoginModalProps) {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleAuthenticated = () => {
    login()
    navigate('/editor')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-orbit-surface text-zinc-400 shadow-lg transition-colors hover:bg-white/10 hover:text-zinc-100"
          aria-label="닫기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <AuthForm mode="login" onAuthenticated={handleAuthenticated} />
        <p className="mt-5 text-center text-sm text-zinc-500">
          계정이 없으신가요?{' '}
          <Link
            to="/signup"
            className="font-medium text-violet-300 underline-offset-4 hover:text-violet-200 hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}

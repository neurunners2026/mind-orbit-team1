import { Link, useNavigate } from 'react-router-dom'
import { AuthForm } from './AuthForm'
import { XIcon } from '../common/XIcon'

type LoginModalProps = {
  onClose: () => void
}

export function LoginModal({ onClose }: LoginModalProps) {
  const navigate = useNavigate()

  const handleAuthenticated = () => {
    navigate('/dashboard')
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
          className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-orbit-surface text-orbit-muted shadow-lg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-orbit-surface-hover hover:text-zinc-100"
          aria-label="닫기"
        >
          <XIcon />
        </button>
        <AuthForm mode="login" onAuthenticated={handleAuthenticated} />
        <p className="mt-5 text-center text-sm text-orbit-muted">
          계정이 없으신가요?{' '}
          <Link
            to="/signup"
            className="font-medium text-orbit-accent underline-offset-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}

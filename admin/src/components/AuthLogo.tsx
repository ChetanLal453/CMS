import Link from 'next/link'

import logo from '@/assets/images/logo.png'
import logoDark from '@/assets/images/logo-dark.png'

const AuthLogo = () => {
  return (
    <div className="auth-brand p-4 text-center">
      <Link href="/" className="logo-light">
        <img src={logo.src} alt="logo" height={28} />
      </Link>
      <Link href="/" className="logo-dark">
        <img src={logoDark.src} alt="dark logo" height={28} />
      </Link>
    </div>
  )
}
export default AuthLogo

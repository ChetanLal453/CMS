import Image from 'next/image'
import Link from 'next/link'

import logo from '@/assets/images/logo.png'
import logoSm from '@/assets/images/logo-sm.png'
import logoDark from '@/assets/images/logo-dark.png'

const LogoBox = () => {
  return (
    <>
      <Link href="/" className="logo logo-light">
        <span className="logo-lg">
          <Image src={logo} className="w-auto h-8" alt="logo" />
        </span>
        <span className="logo-sm">
          <Image src={logoSm} className="w-auto h-8" alt="small logo" />
        </span>
      </Link>

      <Link href="/" className="logo logo-dark">
        <span className="logo-lg">
          <Image src={logoDark} alt="dark logo" className="w-auto h-8" />
        </span>
        <span className="logo-sm">
          <Image src={logoSm} alt="small logo" className="w-auto h-8" />
        </span>
      </Link>
    </>
  )
}
export default LogoBox

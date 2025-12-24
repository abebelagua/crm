'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import Cookies from 'js-cookie'

export function Navbar() {
  const router = useRouter()

  const handleLogout = () => {
    Cookies.remove('accessToken')
    Cookies.remove('refreshToken')
    router.push('/login')
  }

  return (
    <nav className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold">CRM</h1>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => router.push('/clients')}>
              Clients
            </Button>
            <Button variant="ghost" onClick={() => router.push('/users')}>
              Users
            </Button>
            <Button variant="ghost" onClick={() => router.push('/subscription')}>
              Subscription
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}


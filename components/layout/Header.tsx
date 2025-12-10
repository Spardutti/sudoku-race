'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, User as UserIcon, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AuthButtons } from '@/components/auth/AuthButtons'
import { signOut } from '@/actions/auth'
import { toast } from 'sonner'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useAuthState } from '@/lib/hooks/useAuthState'
import type { User } from '@supabase/supabase-js'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'

interface HeaderProps {
  initialUser: User | null
  username: string | null
}

export function Header({ initialUser, username: initialUsername }: HeaderProps) {
  const t = useTranslations('nav')
  const tAuth = useTranslations('auth')
  const tProfile = useTranslations('profile')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuthState({ initialUser })

  const returnUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [mobileMenuOpen])

  const closeMenu = () => setMobileMenuOpen(false)

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    const result = await signOut()
    if (result.success) {
      toast.success(tAuth('signOut'))
      router.push('/')
      router.refresh()
    } else {
      toast.error(result.error)
      setIsLoggingOut(false)
    }
  }

  const navLinks = [
    { href: '/leaderboard', label: t('leaderboard') },
  ]

  return (
    <header className="relative  border-b border-black bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        {/* Branding */}
        <Link href="/" className="font-serif text-2xl font-bold text-black">
          Sudoku Race
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden gap-6 md:flex items-center" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-black transition-colors hover:text-[#1a73e8] hover:underline"
            >
              {link.label}
            </Link>
          ))}

          <LanguageSwitcher />

          {/* Auth State */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2" disabled={isLoggingOut}>
                  <UserIcon className="h-4 w-4" />
                  {user?.user_metadata?.full_name || initialUsername || 'User'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <UserIcon className="h-4 w-4 mr-2" />
                    {tProfile('title')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} disabled={isLoggingOut} className="cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  {isLoggingOut ? `${tAuth('signOut')}...` : tAuth('signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="primary">{tAuth('signIn')}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{tAuth('signIn')}</DialogTitle>
                </DialogHeader>
                <AuthButtons returnUrl={returnUrl} />
              </DialogContent>
            </Dialog>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden min-w-9"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <nav
          className="border-t border-black bg-white md:hidden"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="border-b border-gray-200 px-4 py-3 text-black transition-colors hover:bg-gray-50 hover:text-[#1a73e8]"
              >
                {link.label}
              </Link>
            ))}

            {/* Language Switcher - Mobile */}
            <div className="border-b border-gray-200 px-4 py-3">
              <LanguageSwitcher />
            </div>

            {/* Mobile Auth State */}
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  onClick={closeMenu}
                  className="border-b border-gray-200 px-4 py-3 text-black transition-colors hover:bg-gray-50 hover:text-[#1a73e8] flex items-center gap-2"
                >
                  <UserIcon className="h-4 w-4" />
                  {tProfile('title')}
                </Link>
                <button
                  onClick={() => {
                    closeMenu()
                    handleSignOut()
                  }}
                  className="border-b border-gray-200 px-4 py-3 text-left text-black transition-colors hover:bg-gray-50 hover:text-[#1a73e8] flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {tAuth('signOut')}
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  closeMenu()
                  setAuthDialogOpen(true)
                }}
                className="border-b border-gray-200 px-4 py-3 text-left text-black transition-colors hover:bg-gray-50 hover:text-[#1a73e8] flex items-center gap-2"
              >
                <UserIcon className="h-4 w-4" />
                {tAuth('signIn')}
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}

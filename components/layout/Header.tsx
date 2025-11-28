'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { useRouter } from 'next/navigation'

interface HeaderProps {
  userId: string | null
  username: string | null
}

export function Header({ userId, username }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const router = useRouter()

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
    const result = await signOut()
    if (result.success) {
      toast.success('Signed out successfully')
      router.push('/')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const navLinks = [
    { href: '/', label: "Today's Puzzle" },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/profile', label: 'Profile' },
  ]

  return (
    <header className="relative  border-b border-black bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        {/* Branding */}
        <Link href="/" className="font-serif text-2xl font-bold text-black">
          Sudoku Daily
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

          {/* Auth State */}
          {userId ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-4 w-4" />
                  {username || 'User'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="primary">Sign In</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sign In to Sudoku Daily</DialogTitle>
                </DialogHeader>
                <AuthButtons />
              </DialogContent>
            </Dialog>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden min-w-[36px]"
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

            {/* Mobile Auth State */}
            {userId ? (
              <button
                onClick={() => {
                  closeMenu()
                  handleSignOut()
                }}
                className="border-b border-gray-200 px-4 py-3 text-left text-black transition-colors hover:bg-gray-50 hover:text-[#1a73e8] flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  closeMenu()
                  setAuthDialogOpen(true)
                }}
                className="border-b border-gray-200 px-4 py-3 text-left text-black transition-colors hover:bg-gray-50 hover:text-[#1a73e8] flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Sign In
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}

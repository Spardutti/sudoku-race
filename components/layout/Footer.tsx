import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-black bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-600 md:flex-row">
          {/* Links */}
          <div className="flex gap-4">
            <Link
              href="#privacy"
              className="transition-colors hover:text-black hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              href="#terms"
              className="transition-colors hover:text-black hover:underline"
            >
              Terms of Service
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <span>© {currentYear} Sudoku Race</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

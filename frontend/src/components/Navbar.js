"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/auth'
import { usePathname } from 'next/navigation'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import styles from '@/styles/Navbar.module.css' // Import du style

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const routes = [
    { name: 'Home', path: '/' },
    { name: 'Articles', path: '/articles' },
    ...(user ? [
      { name: 'Profile', path: '/profile' },
      { name: 'Manage Posts', path: '/manage-posts' }
    ] : []),
  ];

  if (!mounted || loading) {
    return null;
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={styles.navLink}
          >
            {isOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-4">
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={`${styles.navLink} ${pathname === route.path ? styles.active : ''}`}
            >
              {route.name}
            </Link>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <button
              onClick={logout}
              className={styles.logoutButton}
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className={styles.loginButton}>
                Login
              </Link>
              <Link href="/register" className={styles.registerButton}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className={styles.mobileMenu}>
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={styles.mobileLink}
            >
              {route.name}
            </Link>
          ))}
          <div className="border-t border-gray-700 pt-4">
            {user ? (
              <button
                onClick={logout}
                className={styles.logoutButton}
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className={styles.mobileLink}>
                  Login
                </Link>
                <Link href="/register" className={styles.registerButton}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

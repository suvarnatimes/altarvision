import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock IntersectionObserver for framer-motion useInView hook as a constructible class
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  root = null
  rootMargin = ""
  thresholds = []
}
global.IntersectionObserver = MockIntersectionObserver as any

// Mock next/navigation
vi.mock('next/navigation', () => {
  return {
    usePathname: () => '/',
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    }),
  }
})

// Mock @clerk/nextjs
vi.mock('@clerk/nextjs', () => {
  return {
    useAuth: () => ({
      isSignedIn: false,
      isLoaded: true,
      userId: null,
    }),
    useUser: () => ({
      isSignedIn: false,
      isLoaded: true,
      user: null,
    }),
    SignInButton: ({ children }: { children: React.ReactNode }) => children,
    SignUpButton: ({ children }: { children: React.ReactNode }) => children,
    UserButton: () => React.createElement('div', { 'data-testid': 'user-button' }, 'UserButton'),
  }
})

// Mock next/image to render a normal img tag with fallback src
vi.mock('next/image', () => {
  return {
    default: ({ src, alt, ...props }: any) => {
      // eslint-disable-next-line @next/next/no-img-element
      return React.createElement('img', { src, alt, ...props })
    }
  }
})

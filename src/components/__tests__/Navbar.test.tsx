import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test } from 'vitest'
import Navbar from '../Navbar'

test('renders Navbar links and auth buttons when logged out', () => {
  render(<Navbar />)

  // Verify desktop navigation links using faster text queries
  const homeLinks = screen.getAllByText('Home')
  expect(homeLinks.length).toBeGreaterThan(0)

  expect(screen.getAllByText('Services').length).toBeGreaterThan(0)
  expect(screen.getAllByText('Prompts').length).toBeGreaterThan(0)
  expect(screen.getAllByText('Contact').length).toBeGreaterThan(0)

  // Verify auth buttons (mocked)
  expect(screen.getByText('Log in')).toBeInTheDocument()
  expect(screen.getByText('Sign up')).toBeInTheDocument()
})

test('toggles mobile menu on menu button click', () => {
  render(<Navbar />)

  // Toggle button search
  const toggleBtn = screen.getByRole('button', { name: 'Toggle menu' })
  expect(toggleBtn).toBeInTheDocument()

  fireEvent.click(toggleBtn)

  // Now, the mobile-specific start project button or links should be mounted
  const startProjectLinks = screen.getAllByText(/Start a Project/i)
  expect(startProjectLinks.length).toBeGreaterThan(1)
})

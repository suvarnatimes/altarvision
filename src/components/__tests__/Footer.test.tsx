import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import Footer from '../Footer'

test('renders Footer brand information and services', () => {
  render(<Footer />)

  // Verify branding description
  expect(
    screen.getByText(/Premium digital agency delivering world-class web/i)
  ).toBeInTheDocument()

  // Verify services are rendered
  expect(screen.getByText('Web Development')).toBeInTheDocument()
  expect(screen.getByText('App Development')).toBeInTheDocument()
  expect(screen.getByText('Software Solutions')).toBeInTheDocument()
})

test('renders contact details correctly', () => {
  render(<Footer />)

  // Verify address, phone number, and email
  expect(screen.getByText(/Machilipatnam, Andhra Pradesh/i)).toBeInTheDocument()
  expect(screen.getByText('+91 6302596477')).toBeInTheDocument()
  expect(screen.getByText('altarvision122@gmail.com')).toBeInTheDocument()
})

test('renders quick links and auth buttons when logged out', () => {
  render(<Footer />)

  // Verify quick links using fast text queries
  expect(screen.getByText('Home')).toBeInTheDocument()
  
  // 'Services' appears both as header and link, so we use getAllByText
  expect(screen.getAllByText('Services').length).toBeGreaterThan(0)

  // Verify Clerk auth buttons (mocked to render text)
  expect(screen.getByText('Log In')).toBeInTheDocument()
  expect(screen.getByText('Sign Up')).toBeInTheDocument()
})

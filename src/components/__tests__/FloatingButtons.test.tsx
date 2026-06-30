import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import FloatingButtons from '../FloatingButtons'

// Mock window.scrollTo to prevent issues in the JSDOM environment
if (typeof window !== 'undefined') {
  window.scrollTo = () => {}
}

test('renders WhatsApp button with correct link', () => {
  render(<FloatingButtons />)
  
  const waLink = screen.getByLabelText('Chat on WhatsApp')
  expect(waLink).toBeInTheDocument()
  expect(waLink).toHaveAttribute('href', expect.stringContaining('https://wa.me/916302596477'))
})

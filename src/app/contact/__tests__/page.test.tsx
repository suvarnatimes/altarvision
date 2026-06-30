import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test } from 'vitest'
import ContactPage from '../page'

test('renders ContactPage components', () => {
  render(<ContactPage />)

  // Verify contact info exists
  expect(screen.getByText('altarvision122@gmail.com')).toBeInTheDocument()
  expect(screen.getByText('+91 6302596477')).toBeInTheDocument()

  // Verify form inputs exist using actual placeholders
  expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument()
  expect(screen.getByPlaceholderText('john@company.com')).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/Tell us about your project/i)).toBeInTheDocument()
})

test('allows form field inputs to be changed', () => {
  render(<ContactPage />)

  const nameInput = screen.getByPlaceholderText('John Doe') as HTMLInputElement
  const emailInput = screen.getByPlaceholderText('john@company.com') as HTMLInputElement

  fireEvent.change(nameInput, { target: { value: 'Alice' } })
  fireEvent.change(emailInput, { target: { value: 'alice@example.com' } })

  expect(nameInput.value).toBe('Alice')
  expect(emailInput.value).toBe('alice@example.com')
})

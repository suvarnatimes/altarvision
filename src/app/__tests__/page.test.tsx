import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import HomePage from '../page'

test('renders HomePage with hero elements', () => {
  render(<HomePage />)
  
  // Verify Global Digital Agency badge text
  expect(
    screen.getByText(/Global Digital Agency/i)
  ).toBeInTheDocument()

  // Verify core services section headings exist (using getAllByText since multiple matches exist on page)
  expect(screen.getAllByText('Web Development').length).toBeGreaterThan(0)
  expect(screen.getAllByText('App Development').length).toBeGreaterThan(0)
  expect(screen.getAllByText('Software Solutions').length).toBeGreaterThan(0)
})

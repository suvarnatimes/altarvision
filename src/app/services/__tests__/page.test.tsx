import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import ServicesPage from '../page'

test('renders ServicesPage hero content and services section', () => {
  render(<ServicesPage />)

  // Verify badge
  expect(screen.getByText('Our Services')).toBeInTheDocument()

  // Verify heading text
  expect(screen.getByText(/Everything You Need to/i)).toBeInTheDocument()

  // Verify some core service titles are displayed (using getAllByText since tabs and headers contain these texts)
  expect(screen.getAllByText('Web Development').length).toBeGreaterThan(0)
  expect(screen.getAllByText('App Development').length).toBeGreaterThan(0)
})

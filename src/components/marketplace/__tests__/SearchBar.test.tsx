import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import SearchBar from '../SearchBar'

test('renders SearchBar with placeholder and submits search query', () => {
  const onSearchMock = vi.fn()
  render(<SearchBar onSearch={onSearchMock} placeholder="Search prompts..." />)

  const input = screen.getByPlaceholderText('Search prompts...') as HTMLInputElement
  expect(input).toBeInTheDocument()

  // Type a query
  fireEvent.change(input, { target: { value: 'midjourney' } })
  expect(input.value).toBe('midjourney')

  // Click search button
  const searchBtn = screen.getByRole('button', { name: 'Search' })
  fireEvent.click(searchBtn)

  expect(onSearchMock).toHaveBeenCalledWith('midjourney')
})

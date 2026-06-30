import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import MarketplaceClient from '../MarketplaceClient'

const mockCategories = [
  { id: 'cat1', name: 'Web Dev', slug: 'web-dev', description: 'Web development prompts', image: '', createdAt: new Date() }
]

const mockPrompts = [
  { 
    id: 'prompt1', 
    title: 'Great React Prompt', 
    slug: 'great-react-prompt', 
    description: 'React developer assistant prompt', 
    categoryId: 'cat1', 
    thumbnail: '', 
    previewImages: [], 
    tags: ['react'], 
    price: 10, 
    featured: false, 
    status: 'published', 
    createdAt: new Date(), 
    updatedAt: new Date() 
  }
]

test('renders MarketplaceClient components with mock data', () => {
  render(<MarketplaceClient initialPrompts={mockPrompts} categories={mockCategories} />)

  // Verify search input is present (regex allowing "Search premium prompts...")
  expect(screen.getByPlaceholderText(/search.*prompts/i)).toBeInTheDocument()

  // Verify the categories and prompts are rendered
  expect(screen.getByText('Great React Prompt')).toBeInTheDocument()
})

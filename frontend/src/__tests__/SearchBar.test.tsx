import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from '@/components/SearchBar'

describe('SearchBar Component', () => {
  it('renders search input and button', () => {
    const handleSearch = jest.fn()
    render(<SearchBar onSearch={handleSearch} placeholder="Search products" />)

    expect(screen.getByPlaceholderText('Search products')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('does not submit with less than 2 characters', async () => {
    const handleSearch = jest.fn()
    render(<SearchBar onSearch={handleSearch} />)

    const input = screen.getByPlaceholderText('Buscar produto...')
    const button = screen.getByRole('button')

    await userEvent.type(input, 'a')
    fireEvent.click(button)

    expect(handleSearch).not.toHaveBeenCalled()
  })

  it('submits with valid input', async () => {
    const handleSearch = jest.fn()
    render(<SearchBar onSearch={handleSearch} />)

    const input = screen.getByPlaceholderText('Buscar produto...')
    const button = screen.getByRole('button')

    await userEvent.type(input, 'arroz')
    fireEvent.click(button)

    expect(handleSearch).toHaveBeenCalledWith('arroz')
  })

  it('clears input when clear button is clicked', async () => {
    const handleSearch = jest.fn()
    render(<SearchBar onSearch={handleSearch} initialValue="test" />)

    const input = screen.getByPlaceholderText('Buscar produto...') as HTMLInputElement
    const clearButton = screen.getAllByRole('button')[1] // Second button is clear

    expect(input.value).toBe('test')
    fireEvent.click(clearButton)
    expect(input.value).toBe('')
  })

  it('respects autoFocus prop', () => {
    const handleSearch = jest.fn()
    render(<SearchBar onSearch={handleSearch} autoFocus={true} />)

    const input = screen.getByPlaceholderText('Buscar produto...')
    expect(input).toHaveFocus()
  })

  it('submits on Enter key', async () => {
    const handleSearch = jest.fn()
    render(<SearchBar onSearch={handleSearch} />)

    const input = screen.getByPlaceholderText('Buscar produto...')

    await userEvent.type(input, 'feijao')
    await userEvent.keyboard('{Enter}')

    expect(handleSearch).toHaveBeenCalledWith('feijao')
  })
})

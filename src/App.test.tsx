import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { App } from '@/App'

function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<div>Home</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('App', () => {
  it('renders layout', () => {
    renderWithRouter()
    expect(screen.getByText('Home')).toBeInTheDocument()
  })
})

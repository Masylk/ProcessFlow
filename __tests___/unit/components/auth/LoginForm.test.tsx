import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/login/page'
import { createClient } from '@supabase/supabase-js'
import '@testing-library/jest-dom'

// Mock des cookies Next.js
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  })
}))

// Mock des actions d'authentification
jest.mock('@/app/login/actions', () => ({
  login: jest.fn().mockImplementation(async (formData) => {
    if (formData.get('email') === 'wrong@example.com') {
      return { error: 'Invalid credentials' }
    }
    return {
      id: '123',
      email: formData.get('email'),
      firstName: 'Test',
      lastName: 'User'
    }
  }),
  signup: jest.fn()
}))

// Mock des modules externes
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn().mockImplementation(() => 
        Promise.resolve({ data: { user: { id: '123' } }, error: null })
      ),
      signUp: jest.fn().mockImplementation(() => 
        Promise.resolve({ data: { user: { id: '123' } }, error: null })
      )
    }
  }))
}))

// Mock Next.js router et autres dépendances
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  })
}))

// Mock PostHog
jest.mock('posthog-js', () => ({
  identify: jest.fn(),
  capture: jest.fn(),
  people: {
    set: jest.fn(),
  },
}))

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  setUser: jest.fn(),
}))

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('LoginPage', () => {
  it('renders login form elements', () => {
    render(<LoginPage />)
    
    // Utiliser getByLabelText car vos inputs ont des labels explicites
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('handles successful login', async () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /log in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      // Vérifie que la fonction login a été appelée
      expect(require('@/app/login/actions').login).toHaveBeenCalled()
    })
  })

  it('displays error message on login failure', async () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /log in/i })

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Login error:',
        'Invalid credentials'
      )
    })
  })

  it('switches between login and signup forms', () => {
    render(<LoginPage />)
    
    // Trouver le bouton de switch par son texte exact
    const switchButton = screen.getByRole('button', { name: /sign up/i })
    fireEvent.click(switchButton)

    // Vérifier que les champs de signup apparaissent
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
  })
})
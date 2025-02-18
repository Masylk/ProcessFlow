import { render, screen, fireEvent } from '@testing-library/react'
import BlockInformations from '../../../app/workspace/[id]/[workflowId]/components/BlockInformations'
import '@testing-library/jest-dom'

describe('BlockInformations', () => {
  const mockBlock = {
    id: 1,
    title: 'Test Block',
    type: 'STEP',
    position: 1,
    icon: 'test-icon.svg',
    description: 'Test description',
    path_id: 1,
    workflow_id: 1,
    averageTime: '10min'
  }

  const mockOnUpdate = jest.fn()

  beforeEach(() => {
    mockOnUpdate.mockClear()
  })

  it('renders block title correctly', () => {
    render(<BlockInformations block={mockBlock} onUpdate={mockOnUpdate} />)
    const titleInput = screen.getByDisplayValue('Test Block')
    expect(titleInput).toBeInTheDocument()
  })

  it('updates title when changed', () => {
    render(<BlockInformations block={mockBlock} onUpdate={mockOnUpdate} />)
    const titleInput = screen.getByDisplayValue('Test Block')
    
    fireEvent.change(titleInput, { target: { value: 'New Title' } })
    fireEvent.blur(titleInput)

    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({
      title: 'New Title'
    }))
  })

  it('sets default title when empty', () => {
    render(<BlockInformations block={mockBlock} onUpdate={mockOnUpdate} />)
    const titleInput = screen.getByDisplayValue('Test Block')
    
    fireEvent.change(titleInput, { target: { value: '' } })
    fireEvent.blur(titleInput)

    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Untitled Block'
    }))
  })
})

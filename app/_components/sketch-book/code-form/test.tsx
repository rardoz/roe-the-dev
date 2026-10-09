import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import CodeForm from '.'

const mockPush = jest.fn()
const mockRouter = { push: mockPush }
jest.mock('next/navigation', () => ({ useRouter: () => mockRouter }))

describe('Sketchbook code form', () => {
  const fetchMock = jest.fn()
  const originalFetch = global.fetch
  beforeEach(() => {
    global.fetch = fetchMock
    fetchMock.mockReset()
    mockPush.mockReset()
  })
  afterAll(() => {
    global.fetch = originalFetch
  })

  it('checks four-character codes and clears errors when editing', async () => {
    fetchMock.mockResolvedValue({
      json: async () => ({ success: false, message: 'Invalid code' }),
    })
    render(<CodeForm lock_id="page-lock" />)
    const input = screen.getByLabelText('Enter 4 digit page code')
    fireEvent.change(input, { target: { value: '123' } })
    expect(fetchMock).not.toHaveBeenCalled()
    fireEvent.change(input, { target: { value: '1234' } })
    await waitFor(() =>
      expect(screen.getByText('Error: Invalid code')).toBeTruthy(),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/page-lock/page-lock/1234',
      expect.objectContaining({ method: 'PUT' }),
    )
    fireEvent.change(input, { target: { value: '123' } })
    expect(screen.queryByText('Error: Invalid code')).toBeNull()
    expect(mockPush).not.toHaveBeenCalled()
  })
})

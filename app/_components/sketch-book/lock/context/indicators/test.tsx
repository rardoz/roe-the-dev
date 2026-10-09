import { useContext } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import LockIndicatorProvider, { lockIndicatorsContext } from '.'

function Status() {
  const { isLoading, pageLockStatus } = useContext(lockIndicatorsContext)
  return (
    <div>
      <span>{isLoading ? 'loading' : 'ready'}</span>
      <span>
        {pageLockStatus
          .map((page) => `${page.page_number}:${page.locked}`)
          .join(',')}
      </span>
    </div>
  )
}

describe('Lock indicators', () => {
  const fetchMock = jest.fn()
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = fetchMock
    fetchMock.mockReset()
  })
  afterAll(() => {
    global.fetch = originalFetch
  })

  it('loads the selected pages and clears status on the cover', async () => {
    fetchMock.mockResolvedValue({
      json: async () => ({
        page_lock_status: [{ page_number: 1, locked: true }],
      }),
    })
    const { rerender } = render(
      <LockIndicatorProvider pageNumbers={[1, 2]}>
        <Status />
      </LockIndicatorProvider>,
    )
    expect(screen.getByText('loading')).toBeTruthy()
    await waitFor(() => expect(screen.getByText('1:true')).toBeTruthy())
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/page-lock?page_number=1&page_number=2',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
    rerender(
      <LockIndicatorProvider pageNumbers={[]}>
        <Status />
      </LockIndicatorProvider>,
    )
    expect(screen.getByText('ready')).toBeTruthy()
    expect(screen.queryByText('1:true')).toBeNull()
  })

  it('ignores a response for pages that are no longer selected', async () => {
    let resolveFirst!: (value: unknown) => void
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve
        }),
    )
    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        page_lock_status: [{ page_number: 3, locked: true }],
      }),
    })
    const { rerender } = render(
      <LockIndicatorProvider pageNumbers={[1, 2]}>
        <Status />
      </LockIndicatorProvider>,
    )
    rerender(
      <LockIndicatorProvider pageNumbers={[3, 4]}>
        <Status />
      </LockIndicatorProvider>,
    )
    await waitFor(() => expect(screen.getByText('3:true')).toBeTruthy())
    resolveFirst({
      json: async () => ({
        page_lock_status: [{ page_number: 1, locked: true }],
      }),
    })
    await waitFor(() => expect(screen.queryByText('1:true')).toBeNull())
    expect(screen.getByText('3:true')).toBeTruthy()
  })
})

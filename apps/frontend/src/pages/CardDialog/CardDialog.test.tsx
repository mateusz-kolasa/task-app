import { customRender } from 'utils/testHelper'
import { fireEvent, waitFor } from '@testing-library/dom'
import { describe, it, expect, vi, Mock } from 'vitest'
import CardDialog from './CardDialog'
import { SAMPLE_LISTS } from 'mocks/data/lists'
import { server } from 'mocks/api/server'
import { HttpResponse, http } from 'msw'

const useNavigateMock: Mock = vi.fn()
vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '3', cardId: 1 }),
    useNavigate: (): Mock => useNavigateMock,
  }
})

describe('CardDialog', () => {
  it('renders CardDialog component', () => {
    customRender(<CardDialog />)
  })

  it(`renders with title`, async () => {
    const { getByText } = customRender(<CardDialog />)
    await waitFor(() => expect(getByText(SAMPLE_LISTS[0].cards[0].title)).toBeTruthy())
  })

  it('navigates back to board page on close click', async () => {
    const { getByRole } = customRender(<CardDialog />)
    fireEvent.click(getByRole('button', { name: '' }))

    expect(useNavigateMock).toHaveBeenCalledWith('/board/3')
  })

  it('navigates back to board page with invalid card id', async () => {
    const { getByRole } = customRender(<CardDialog />)
    server.use(
      http.get('http://localhost:3000/api/board/:id', async () => {
        return new HttpResponse(
          JSON.stringify({
            lists: [{ cards: [] }],
          }),
          { status: 200 }
        )
      })
    )

    fireEvent.click(getByRole('button', { name: '' }))
    expect(useNavigateMock).toHaveBeenCalledWith('/board/3')
  })
})

import { TestDragAndDropContext, customRender } from 'utils/testHelper'
import { SAMPLE_LISTS } from 'mocks/data/lists'
import { fireEvent, waitFor } from '@testing-library/dom'
import { describe, it, expect, vi, Mock } from 'vitest'
import TaskCard from './TaskCard'

const useNavigateMock: Mock = vi.fn()
vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '3' }),
    useNavigate: (): Mock => useNavigateMock,
  }
})

const list = SAMPLE_LISTS[0]

describe('TaskCard', () => {
  it('renders TaskCard component', () => {
    customRender(
      <TestDragAndDropContext>
        <TaskCard listId={list.id} cardId={list.cards[0].id} />
      </TestDragAndDropContext>
    )
  })

  it(`renders with title`, async () => {
    const { getByText } = customRender(
      <TestDragAndDropContext>
        <TaskCard listId={list.id} cardId={list.cards[0].id} />
      </TestDragAndDropContext>
    )
    await waitFor(() => expect(getByText(list.cards[0].title)).toBeTruthy())
  })

  it('navigates to card page on click', async () => {
    const { getByText } = customRender(
      <TestDragAndDropContext>
        <TaskCard listId={list.id} cardId={list.cards[0].id} />
      </TestDragAndDropContext>
    )
    await waitFor(() => expect(getByText(list.cards[0].title)).toBeTruthy())

    fireEvent.click(getByText(list.cards[0].title))
    expect(useNavigateMock).toHaveBeenCalledWith(`card/${list.cards[0].id}`)
  })
})

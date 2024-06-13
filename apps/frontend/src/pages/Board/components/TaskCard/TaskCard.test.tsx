import { customRender } from 'utils/testHelper'
import { SAMPLE_LISTS } from 'mocks/data/lists'
import { waitFor } from '@testing-library/dom'
import { describe, it, expect, vi } from 'vitest'
import TaskCard from './TaskCard'

vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '3' }),
  }
})

const list = SAMPLE_LISTS[0]

describe('TaskCard', () => {
  it('renders TaskCard component', () => {
    customRender(<TaskCard listId={list.id} cardId={list.cards[0].id} />)
  })

  it(`renders with title`, async () => {
    const { getByText } = customRender(<TaskCard listId={list.id} cardId={list.cards[0].id} />)
    await waitFor(() => expect(getByText(list.cards[0].title)).toBeTruthy())
  })
})

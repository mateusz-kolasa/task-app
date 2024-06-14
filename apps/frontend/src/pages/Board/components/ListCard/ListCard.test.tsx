import { customRender } from 'utils/testHelper'
import ListCard from './ListCard'
import { SAMPLE_LISTS } from 'mocks/data/lists'
import { waitFor } from '@testing-library/dom'
import { describe, it, expect, vi } from 'vitest'

vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '3' }),
  }
})

describe('ListCard', () => {
  it('renders ListCard component', () => {
    customRender(<ListCard listId={SAMPLE_LISTS[0].id} />)
  })

  SAMPLE_LISTS.forEach(list =>
    it(`Renders correctly with ${list.cards.length} cards`, async () => {
      const { getByTestId } = customRender(<ListCard listId={list.id} />)
      const grid = getByTestId('list-stack')
      expect(grid).toBeTruthy()

      await waitFor(() =>
        expect(getByTestId('list-stack').childNodes.length).toBe(list.cards.length)
      )
    })
  )
})

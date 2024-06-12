import { customRender } from 'utils/testHelper'
import ListCard from './ListCard'
import { SAMPLE_LISTS } from 'mocks/data/lists'
import { waitFor } from '@testing-library/dom'
import { describe, it, expect } from 'vitest'

describe('ListCard', () => {
  it('renders ListCard component', () => {
    customRender(<ListCard list={SAMPLE_LISTS[0]} />)
  })

  SAMPLE_LISTS.forEach(list =>
    it(`Renders correctly with ${list.cards.length} cards`, async () => {
      const { getByTestId } = customRender(<ListCard list={list} />)
      const grid = getByTestId('list-stack')
      expect(grid).toBeTruthy()

      // Cards and create card button
      await waitFor(() =>
        expect(getByTestId('list-stack').childNodes.length).toBe(list.cards.length + 1)
      )
    })
  )
})

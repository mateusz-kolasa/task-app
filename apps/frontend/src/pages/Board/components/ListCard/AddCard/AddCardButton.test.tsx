import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import AddCardButton from './AddCardButton'
import * as useIsAuthorized from 'hooks/useIsAuthorized'

vi.mock(`hooks/useIsAuthorized`, () => ({
  default: () => () => true,
}))

describe('AddCardButton', () => {
  it('renders AddCardButton component', () => {
    customRender(<AddCardButton listId={1} />)
  })

  it('Opens form on click', async () => {
    const { getByText, queryByText } = customRender(<AddCardButton listId={1} />)

    expect(getByText('card.create.new')).toBeTruthy()
    fireEvent.click(getByText('card.create.new'))

    await waitFor(() => expect(queryByText('card.create.new')).toBeNull())
  })

  it('No add buton when unauthorized', async () => {
    vi.spyOn(useIsAuthorized, 'default').mockReturnValue(() => false)
    const { queryByText } = customRender(<AddCardButton listId={1} />)
    expect(queryByText('card.create.new')).toBeNull()
  })
})

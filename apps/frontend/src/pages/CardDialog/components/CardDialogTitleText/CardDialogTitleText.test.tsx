import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import * as useIsAuthorized from 'hooks/useIsAuthorized'
import CardDialogTitleText from './CardDialogTitleText'
import { SAMPLE_LISTS } from 'mocks/data/lists'

vi.mock(`hooks/useIsAuthorized`, () => ({
  default: () => () => true,
}))

vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '3', cardId: '1' }),
  }
})

const list = SAMPLE_LISTS[0]
const card = list.cards[0]

describe('CardDialogTitleText', () => {
  it('renders CardDialogTitleText component', () => {
    customRender(<CardDialogTitleText listId={1} />)
  })

  it('Opens form on click', async () => {
    const { getByText, queryByRole, getByRole } = customRender(
      <CardDialogTitleText listId={list.id} />
    )
    await waitFor(() => expect(getByText(card.title)).toBeTruthy())
    expect(queryByRole('textbox')).toBeNull()
    fireEvent.click(getByText(card.title))
    await waitFor(() => expect(getByRole('textbox')).toBeTruthy())
  })

  it('Doesnt open form for unauthorized', async () => {
    vi.spyOn(useIsAuthorized, 'default').mockReturnValue(() => false)

    const { getByText, queryByRole } = customRender(<CardDialogTitleText listId={list.id} />)
    await waitFor(() => expect(getByText(card.title)).toBeTruthy())
    expect(queryByRole('textbox')).toBeNull()
    fireEvent.click(getByText(card.title))
    await waitFor(() => expect(queryByRole('textbox')).toBeNull())
  })
})

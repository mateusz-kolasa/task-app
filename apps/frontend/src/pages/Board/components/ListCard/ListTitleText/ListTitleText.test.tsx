import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import * as useIsAuthorized from 'hooks/useIsAuthorized'
import ListTitleText from './ListTitleText'
import { SAMPLE_LISTS } from 'mocks/data/lists'

vi.mock(`hooks/useIsAuthorized`, () => ({
  default: () => () => true,
}))

vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '3' }),
  }
})

const list = SAMPLE_LISTS[0]

describe('ListTitleText', () => {
  it('renders ListTitleText component', () => {
    customRender(<ListTitleText listId={1} dragHandleProps={null} />)
  })

  it('Opens form on click', async () => {
    const { getByText, queryByRole, getByRole } = customRender(
      <ListTitleText listId={list.id} dragHandleProps={null} />
    )
    await waitFor(() => expect(getByText(list.title)).toBeTruthy())
    expect(queryByRole('textbox')).toBeNull()
    fireEvent.click(getByText(list.title))
    await waitFor(() => expect(getByRole('textbox')).toBeTruthy())
  })

  it('Doesnt open form for unauthorized', async () => {
    vi.spyOn(useIsAuthorized, 'default').mockReturnValue(() => false)

    const { getByText, queryByRole } = customRender(
      <ListTitleText listId={list.id} dragHandleProps={null} />
    )
    await waitFor(() => expect(getByText(list.title)).toBeTruthy())
    expect(queryByRole('textbox')).toBeNull()
    fireEvent.click(getByText(list.title))
    await waitFor(() => expect(queryByRole('textbox')).toBeNull())
  })
})

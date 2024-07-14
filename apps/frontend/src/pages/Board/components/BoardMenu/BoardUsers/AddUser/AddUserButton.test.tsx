import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import AddUserButton from './AddUserButton'
import * as useIsAuthorized from 'hooks/useIsAuthorized'

vi.mock(`hooks/useIsAuthorized`, () => ({
  default: () => () => true,
}))

describe('AddUserButton', () => {
  it('renders AddUserButton component', () => {
    customRender(<AddUserButton />)
  })

  it('Opens form on click', async () => {
    const { getByText, queryByText } = customRender(<AddUserButton />)

    expect(getByText('board.users.add.button')).toBeTruthy()
    fireEvent.click(getByText('board.users.add.button'))

    await waitFor(() => expect(queryByText('board.users.add.button')).toBeNull())
  })

  it('No add buton when unauthorized', async () => {
    vi.spyOn(useIsAuthorized, 'default').mockReturnValue(() => false)
    const { queryByText } = customRender(<AddUserButton />)
    expect(queryByText('board.users.add.button')).toBeNull()
  })
})

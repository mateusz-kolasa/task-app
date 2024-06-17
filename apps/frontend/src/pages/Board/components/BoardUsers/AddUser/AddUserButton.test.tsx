import { customRender } from 'utils/testHelper'
import { describe, it, expect } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import AddUserButton from './AddUserButton'

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
})

import { customRender } from 'utils/testHelper'
import { describe, expect, it, vi } from 'vitest'
import BoardMenuMain from './BoardMenuMain'
import { fireEvent } from '@testing-library/dom'

const toggleMenu = vi.fn()
const setIsInUsersSection = vi.fn()

describe('BoardMenuMain', () => {
  it('renders BoardMenu component', () => {
    customRender(
      <BoardMenuMain toggleMenu={toggleMenu} setIsInUsersSection={setIsInUsersSection} />
    )
  })

  it('moves to user section on click', () => {
    const { getByText } = customRender(
      <BoardMenuMain toggleMenu={toggleMenu} setIsInUsersSection={setIsInUsersSection} />
    )

    fireEvent.click(getByText('board.users.list.title'))
    expect(setIsInUsersSection).toHaveBeenCalledWith(true)
  })

  it('closes menu on click', () => {
    const { getByRole } = customRender(
      <BoardMenuMain toggleMenu={toggleMenu} setIsInUsersSection={setIsInUsersSection} />
    )

    fireEvent.click(getByRole('button', { name: '' }))
    expect(toggleMenu).toHaveBeenCalled()
  })
})

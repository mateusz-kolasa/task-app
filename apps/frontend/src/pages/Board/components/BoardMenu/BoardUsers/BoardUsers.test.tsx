import { customRender } from 'utils/testHelper'
import { fireEvent, waitFor } from '@testing-library/dom'
import { describe, it, expect, vi } from 'vitest'
import BoardUsers from './BoardUsers'
import { SAMPLE_BOARDS_FULL } from 'mocks/data/boards-full'
import * as reactRouter from 'react-router-dom'

vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '1' }),
  }
})
const toggleMenu = vi.fn()
const setIsInUsersSection = vi.fn()

describe('BoardUsers', () => {
  it('renders BoardUsers component', () => {
    customRender(
      <BoardUsers
        toggleMenu={toggleMenu}
        isInUsersSection={true}
        setIsInUsersSection={setIsInUsersSection}
      />
    )
  })

  Object.keys(SAMPLE_BOARDS_FULL).forEach(boardId =>
    it(`Renders correctly with ${SAMPLE_BOARDS_FULL[boardId].users.length} users`, async () => {
      vi.spyOn(reactRouter, 'useParams').mockReturnValue({ boardId })
      const { getAllByTestId } = customRender(
        <BoardUsers
          toggleMenu={toggleMenu}
          isInUsersSection={true}
          setIsInUsersSection={setIsInUsersSection}
        />
      )
      await waitFor(() =>
        expect(getAllByTestId('board-user').length).toBe(SAMPLE_BOARDS_FULL[boardId].users.length)
      )
    })
  )

  it('moves to main section on click', () => {
    const { getAllByRole } = customRender(
      <BoardUsers
        toggleMenu={toggleMenu}
        isInUsersSection={true}
        setIsInUsersSection={setIsInUsersSection}
      />
    )

    fireEvent.click(getAllByRole('button', { name: '' })[0])
    expect(setIsInUsersSection).toHaveBeenCalledWith(false)
  })

  it('closes menu on click', () => {
    const { getAllByRole } = customRender(
      <BoardUsers
        toggleMenu={toggleMenu}
        isInUsersSection={true}
        setIsInUsersSection={setIsInUsersSection}
      />
    )

    fireEvent.click(getAllByRole('button', { name: '' })[1])
    expect(toggleMenu).toHaveBeenCalled()
  })
})

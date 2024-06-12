import { customRender } from 'utils/testHelper'
import { describe, it, expect, Mock, vi } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { BoardData } from 'shared-types'
import BoardCard from './BoardCard'

const useNavigateMock: Mock = vi.fn()
vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useNavigate: (): Mock => useNavigateMock,
  }
})

const board: BoardData = {
  id: 1,
  title: 'board title',
  description: '',
}

describe('BoardCard', () => {
  it('renders Dashboard component', () => {
    customRender(<BoardCard board={board} />)
  })

  it('uses board title', async () => {
    const { getByText } = customRender(<BoardCard board={board} />)
    expect(getByText(board.title)).toBeTruthy()
  })

  it('navigates to board page on click', async () => {
    const { getByRole } = customRender(<BoardCard board={board} />)

    fireEvent.click(getByRole('button'))
    expect(useNavigateMock).toHaveBeenCalledWith(`/board/${board.id}`)
  })
})

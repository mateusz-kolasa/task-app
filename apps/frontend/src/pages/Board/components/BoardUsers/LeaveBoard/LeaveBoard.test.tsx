import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import * as useIsAuthorized from 'hooks/useIsAuthorized'
import LeaveBoard from './LeaveBoard'

vi.mock(`hooks/useIsAuthorized`, () => ({
  default: () => () => false,
}))

vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '1' }),
  }
})

describe('LeaveBoard', () => {
  it('renders LeaveBoard component', () => {
    customRender(<LeaveBoard />)
  })

  it('renders leave button for users', async () => {
    const { getByText } = customRender(<LeaveBoard />)
    expect(getByText('board.leave.button')).toBeTruthy()
  })

  it('renders leave button for owner', async () => {
    vi.spyOn(useIsAuthorized, 'default').mockReturnValueOnce(() => true)
    const { getByText } = customRender(<LeaveBoard />)
    expect(getByText('board.delete.button')).toBeTruthy()
  })

  it('opens confirmation dialog on click', async () => {
    const { getByText, queryByText } = customRender(<LeaveBoard />)
    expect(queryByText('board.delete.confirmation.text')).toBeNull()
    fireEvent.click(getByText('board.leave.button'))
    await waitFor(() => expect(getByText('board.leave.confirmation.text')).toBeTruthy())
  })
})

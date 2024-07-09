import { customRender } from 'utils/testHelper'
import { describe, it, expect, Mock, vi } from 'vitest'
import { fireEvent } from '@testing-library/react'
import HomeButton from './HomeButton'

const useNavigateMock: Mock = vi.fn()
vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useNavigate: (): Mock => useNavigateMock,
  }
})

describe('HomeButton', () => {
  it('renders HomeButton component', () => {
    customRender(<HomeButton />)
  })

  it('navigates to dashboard on click', async () => {
    const { getByText } = customRender(<HomeButton />)

    fireEvent.click(getByText('Task App'))
    expect(useNavigateMock).toHaveBeenCalledWith('/dashboard')
  })
})

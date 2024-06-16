import { customRender } from 'utils/testHelper'
import { waitFor } from '@testing-library/dom'
import { describe, it, expect, vi } from 'vitest'
import BoardMenu from './BoardMenu'
import { SAMPLE_BOARDS_FULL } from 'mocks/data/boards-full'

vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '1' }),
  }
})

describe('BoardMenu', () => {
  it('renders BoardMenu component', () => {
    customRender(<BoardMenu />)
  })

  it(`renders with title`, async () => {
    const { getByText } = customRender(<BoardMenu />)
    await waitFor(() => expect(getByText(SAMPLE_BOARDS_FULL['1'].title)).toBeTruthy())
    await waitFor(() => expect(getByText(SAMPLE_BOARDS_FULL['1'].description ?? '')).toBeTruthy())
  })
})

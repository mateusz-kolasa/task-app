import { customRender } from 'utils/testHelper'
import { describe, it, vi } from 'vitest'
import BoardMenu from './BoardMenu'

vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '1' }),
  }
})
const toggleMenu = vi.fn()

describe('BoardMenu', () => {
  it('renders BoardMenu component', () => {
    customRender(<BoardMenu toggleMenu={toggleMenu} />)
  })
})

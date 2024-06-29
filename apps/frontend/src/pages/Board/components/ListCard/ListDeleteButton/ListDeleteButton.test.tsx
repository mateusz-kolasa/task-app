import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi } from 'vitest'
import ListDeleteButton from './ListDeleteButton'
import * as useIsAuthorized from 'hooks/useIsAuthorized'

vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '1' }),
  }
})

vi.mock(`hooks/useIsAuthorized`, () => ({
  default: () => () => true,
}))

describe('ListDeleteButton', () => {
  it('renders ListDeleteButton component', () => {
    customRender(<ListDeleteButton listId={1} />)
  })

  it('renders button when authorized', async () => {
    const { getByRole } = customRender(<ListDeleteButton listId={1} />)
    expect(getByRole('button')).toBeTruthy()
  })

  it('hides button when unauthorized', async () => {
    vi.spyOn(useIsAuthorized, 'default').mockReturnValue(() => false)
    const { queryByRole } = customRender(<ListDeleteButton listId={1} />)
    expect(queryByRole('button')).toBeNull()
  })
})

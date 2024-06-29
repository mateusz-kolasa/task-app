import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi } from 'vitest'
import * as useIsAuthorized from 'hooks/useIsAuthorized'
import CardDeleteButton from './CardDeleteButton'

vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '1', cardId: '1' }),
  }
})

vi.mock(`hooks/useIsAuthorized`, () => ({
  default: () => () => true,
}))

describe('CardDeleteButton', () => {
  it('renders CardDeleteButton component', () => {
    customRender(<CardDeleteButton listId={1} />)
  })

  it('renders button when authorized', async () => {
    const { getByRole } = customRender(<CardDeleteButton listId={1} />)
    expect(getByRole('button')).toBeTruthy()
  })

  it('hides button when unauthorized', async () => {
    vi.spyOn(useIsAuthorized, 'default').mockReturnValue(() => false)
    const { queryByRole } = customRender(<CardDeleteButton listId={1} />)
    expect(queryByRole('button')).toBeNull()
  })
})

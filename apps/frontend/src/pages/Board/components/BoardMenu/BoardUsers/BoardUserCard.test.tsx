import { customRender } from 'utils/testHelper'
import { waitFor } from '@testing-library/dom'
import { describe, it, expect, vi } from 'vitest'
import BoardUserCard from './BoardUserCard'
import { SAMPLE_BOARD_USERS } from 'mocks/data/board-users'
import { server } from 'mocks/api/server'
import { HttpResponse, http } from 'msw'
import { Grid } from '@mantine/core'

vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '1' }),
  }
})

const permissionText: Record<number, string> = {
  0: 'board.permission.view',
  1: 'board.permission.edit',
  2: 'board.permission.admin',
  3: 'board.permission.owner',
}

describe('BoardUserCard', () => {
  it('renders BoardUserCard component', () => {
    customRender(
      <Grid>
        <BoardUserCard userId={1} />
      </Grid>
    )
  })

  SAMPLE_BOARD_USERS.users.forEach(user =>
    it(`Renders username and role ${user.permissions}`, async () => {
      server.use(
        http.get('http://localhost:3000/api/board/:id', async () => {
          return new HttpResponse(JSON.stringify(SAMPLE_BOARD_USERS), { status: 200 })
        })
      )
      const { getByText } = customRender(
        <Grid>
          <BoardUserCard userId={user.id} />
        </Grid>
      )

      await waitFor(() => expect(getByText(user.user.username)).toBeTruthy())
      expect(getByText(permissionText[user.permissions])).toBeTruthy()
    })
  )
})

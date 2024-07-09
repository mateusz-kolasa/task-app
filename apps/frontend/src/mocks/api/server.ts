import SERVER_ERRORS from 'consts/server-errors'
import { SAMPLE_BOARDS } from 'mocks/data/boards'
import { SAMPLE_BOARDS_FULL } from 'mocks/data/boards-full'
import { SAMPLE_LISTS } from 'mocks/data/lists'
import { MOCK_USER } from 'mocks/data/user'
import { http, HttpResponse, delay } from 'msw'
import { setupServer } from 'msw/node'
import { UserLogin } from 'pages/Login/Login'
import { UserRegister } from 'pages/Register/Register'

const handlers = [
  http.all('*', async () => {
    await delay(200)
  }),
  http.post('http://localhost:3000/api/auth/login', async ({ request }) => {
    const { password } = (await request.json()) as UserLogin
    if (password === 'invalidPassword') {
      return new HttpResponse(null, { status: 401 })
    } else {
      return new HttpResponse(null, { status: 200 })
    }
  }),

  http.post('http://localhost:3000/api/auth/register', async ({ request }) => {
    const { username } = (await request.json()) as UserRegister

    if (username === 'takenUser') {
      return new HttpResponse(JSON.stringify({ message: SERVER_ERRORS.usernameTaken }), {
        status: 400,
      })
    } else {
      return new HttpResponse(null, { status: 200 })
    }
  }),
  http.delete('http://localhost:3000/api/auth/logout', () => {
    return new HttpResponse(null, { status: 200 })
  }),
  http.get('http://localhost:3000/api/auth', async () => {
    return new HttpResponse(JSON.stringify(MOCK_USER), { status: 200 })
  }),
  http.get('http://localhost:3000/api/board', async () => {
    return new HttpResponse(JSON.stringify(SAMPLE_BOARDS[0]), { status: 200 })
  }),
  http.post('http://localhost:3000/api/board/create', async () => {
    return new HttpResponse(null, { status: 200 })
  }),
  http.get('http://localhost:3000/api/board/:id', async ({ params }) => {
    const { id } = params
    return new HttpResponse(JSON.stringify(SAMPLE_BOARDS_FULL[id as string]), { status: 200 })
  }),
  http.patch('http://localhost:3000/api/board/change-title', async () => {
    return new HttpResponse(JSON.stringify(SAMPLE_BOARDS_FULL['1']), { status: 200 })
  }),
  http.patch('http://localhost:3000/api/board/change-description', async () => {
    return new HttpResponse(JSON.stringify(SAMPLE_BOARDS_FULL['1']), { status: 200 })
  }),
  http.post('http://localhost:3000/api/list', async () => {
    return new HttpResponse(JSON.stringify(SAMPLE_BOARDS_FULL['3']), { status: 200 })
  }),
  http.post('http://localhost:3000/api/card', async () => {
    return new HttpResponse(JSON.stringify(SAMPLE_LISTS[0]), { status: 200 })
  }),
  http.post('http://localhost:3000/api/board/users/add', async () => {
    return new HttpResponse(
      JSON.stringify({
        id: 1,
        userId: 1,
        boardId: 1,
        permissions: 0,
        user: {
          username: 'user',
        },
      }),
      { status: 200 }
    )
  }),
  http.patch('http://localhost:3000/api/list/change-title', async () => {
    return new HttpResponse(JSON.stringify(SAMPLE_LISTS[0]), { status: 200 })
  }),
  http.patch('http://localhost:3000/api/card/change-title', async () => {
    return new HttpResponse(JSON.stringify(SAMPLE_LISTS[0].cards[0]), { status: 200 })
  }),
  http.patch('http://localhost:3000/api/card/change-description', async () => {
    return new HttpResponse(JSON.stringify(SAMPLE_LISTS[0].cards[0]), { status: 200 })
  }),
]
export const server = setupServer(...handlers)

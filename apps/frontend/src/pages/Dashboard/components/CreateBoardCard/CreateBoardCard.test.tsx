import { customRender } from 'utils/testHelper'
import { describe, it, expect } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import CreateBoardCard from './CreateBoardCard'
import { server } from 'mocks/api/server'
import { HttpResponse, http } from 'msw'

describe('CreateBoardCard', () => {
  it('renders CreateBoardCard component', () => {
    customRender(<CreateBoardCard />)
  })

  it('Opens form on click', async () => {
    const { queryByLabelText, getByLabelText, getByText } = customRender(<CreateBoardCard />)

    expect(queryByLabelText('board.create.label')).toBeNull()
    fireEvent.click(getByText('board.create.new'))

    await waitFor(() => expect(getByLabelText('board.create.label')).toBeTruthy())
  })

  it('Creates board and closes form', async () => {
    const { queryByLabelText, getByLabelText, getByText } = customRender(<CreateBoardCard />)

    expect(queryByLabelText('board.create.label')).toBeNull()
    fireEvent.click(getByText('board.create.new'))

    await waitFor(() => expect(getByLabelText('board.create.label')).toBeTruthy())
    fireEvent.change(getByLabelText('board.create.label'), { target: { value: 'board title' } })
    fireEvent.click(getByText('board.create.button'))

    await waitFor(() => expect(queryByLabelText('board.create.label')).toBeNull())
  })

  it('Shows error notification on error', async () => {
    server.use(
      http.post('http://localhost:3000/api/board/create', async () => {
        return new HttpResponse(null, { status: 400 })
      })
    )
    const { queryByLabelText, getByLabelText, getByText } = customRender(<CreateBoardCard />)

    expect(queryByLabelText('board.create.label')).toBeNull()
    fireEvent.click(getByText('board.create.new'))

    await waitFor(() => expect(getByLabelText('board.create.label')).toBeTruthy())
    fireEvent.change(getByLabelText('board.create.label'), { target: { value: 'board title' } })
    fireEvent.click(getByText('board.create.button'))

    await waitFor(() => expect(getByText('board.create.error.title')).toBeTruthy())
    expect(getByLabelText('board.create.label')).toBeTruthy()
  })
})

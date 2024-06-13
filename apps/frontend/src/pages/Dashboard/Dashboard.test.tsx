import { customRender } from 'utils/testHelper'
import { describe, it, expect } from 'vitest'
import { waitFor } from '@testing-library/react'
import Dashboard from './Dashboard'
import { server } from 'mocks/api/server'
import { HttpResponse, http } from 'msw'
import { SAMPLE_BOARDS } from 'mocks/data/boards'

describe('Dashboard', () => {
  it('renders Dashboard component', () => {
    customRender(<Dashboard />)
  })

  SAMPLE_BOARDS.forEach(boards =>
    it(`Renders correctly with ${boards.length} boards`, async () => {
      server.use(
        http.get('http://localhost:3000/api/board', async () => {
          return new HttpResponse(JSON.stringify(boards), { status: 200 })
        })
      )

      const { getByTestId } = customRender(<Dashboard />)
      const grid = getByTestId('dashboard-grid')
      expect(grid).toBeTruthy()

      // Boards and create board button
      await waitFor(() =>
        expect(getByTestId('dashboard-grid').childNodes.length).toBe(boards.length + 1)
      )
    })
  )
})

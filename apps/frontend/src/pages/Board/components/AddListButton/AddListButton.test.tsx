import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import AddListButton from './AddListButton'
import * as useIsAuthorized from 'hooks/useIsAuthorized'

vi.mock(`hooks/useIsAuthorized`, () => ({
  default: () => () => true,
}))

describe('AddListButton', () => {
  it('renders AddListButton component', () => {
    customRender(<AddListButton />)
  })

  it('Opens form on click', async () => {
    const { getByText, queryByText } = customRender(<AddListButton />)

    expect(getByText('list.create.new')).toBeTruthy()
    fireEvent.click(getByText('list.create.new'))

    await waitFor(() => expect(queryByText('list.create.new')).toBeNull())
  })

  it('No add buton when unauthorized', async () => {
    vi.spyOn(useIsAuthorized, 'default').mockReturnValue(() => false)
    const { queryByText } = customRender(<AddListButton />)
    expect(queryByText('list.create.new')).toBeNull()
  })
})

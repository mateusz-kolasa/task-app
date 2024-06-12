import { customRender } from 'utils/testHelper'
import { describe, it, expect } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import ListButton from './ListButton'

describe('ListButton', () => {
  it('renders ListButton component', () => {
    customRender(<ListButton />)
  })

  it('Opens form on click', async () => {
    const { getByText, queryByText } = customRender(<ListButton />)

    expect(getByText('list.create.new')).toBeTruthy()
    fireEvent.click(getByText('list.create.new'))

    await waitFor(() => expect(queryByText('list.create.new')).toBeNull())
  })
})

import { customRender } from 'utils/testHelper'
import { describe, it, expect } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import AddCardButton from './AddCardButton'

describe('AddCardButton', () => {
  it('renders AddCardButton component', () => {
    customRender(<AddCardButton listId={1} />)
  })

  it('Opens form on click', async () => {
    const { getByText, queryByText } = customRender(<AddCardButton listId={1} />)

    expect(getByText('card.create.new')).toBeTruthy()
    fireEvent.click(getByText('card.create.new'))

    await waitFor(() => expect(queryByText('card.create.new')).toBeNull())
  })
})

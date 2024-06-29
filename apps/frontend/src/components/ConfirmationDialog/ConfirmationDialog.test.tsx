import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi } from 'vitest'
import ConfirmationDialog from './ConfirmationDialog'
import { fireEvent } from '@testing-library/dom'

const title = 'title text'
const confirm = vi.fn()
const close = vi.fn()

describe('ConfirmationDialog', () => {
  it('renders ConfirmationDialog component', () => {
    customRender(<ConfirmationDialog title={title} isOpen={true} confirm={confirm} close={close} />)
  })

  it('renders when open', async () => {
    const { getByText } = customRender(
      <ConfirmationDialog title={title} isOpen={true} confirm={confirm} close={close} />
    )

    expect(getByText(title)).toBeTruthy()
    expect(getByText('button.confirm')).toBeTruthy()
    expect(getByText('button.cancel')).toBeTruthy()
  })

  it('hidden when not open', async () => {
    const { queryByText } = customRender(
      <ConfirmationDialog title={title} isOpen={false} confirm={confirm} close={close} />
    )

    expect(queryByText(title)).toBeNull()
    expect(queryByText('button.confirm')).toBeNull()
    expect(queryByText('button.cancel')).toBeNull()
  })

  it('confirms on click', async () => {
    const { getByText } = customRender(
      <ConfirmationDialog title={title} isOpen={true} confirm={confirm} close={close} />
    )

    fireEvent.click(getByText('button.confirm'))
    expect(confirm).toHaveBeenCalled()
  })

  it('closes on click', async () => {
    const { getByText } = customRender(
      <ConfirmationDialog title={title} isOpen={true} confirm={confirm} close={close} />
    )

    fireEvent.click(getByText('button.cancel'))
    expect(close).toHaveBeenCalled()
  })
})

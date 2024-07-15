import { FocusEvent, KeyboardEvent } from 'react'

export const selectOnFocus = (event: FocusEvent<HTMLTextAreaElement, Element>) =>
  event.target.select()

export const handleKeyDown =
  (onEnter: () => void, onEscape?: () => void) => (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter') {
      onEnter()
      event.stopPropagation()
      event.preventDefault()
    } else if (event.key === 'Escape' && onEscape) {
      onEscape()
      event.stopPropagation()
      event.preventDefault()
    }
  }

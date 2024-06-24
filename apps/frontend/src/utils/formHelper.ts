import { FocusEvent } from 'react'

export const selectOnFocus = (event: FocusEvent<HTMLTextAreaElement, Element>) =>
  event.target.select()

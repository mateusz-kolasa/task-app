import { Card } from '@mantine/core'
import { useClickOutside, useMergedRef } from '@mantine/hooks'
import { LIST_MAX_HEIGHT, LIST_WIDTH } from 'consts/style-consts'
import { PropsWithChildren } from 'react'
import classes from './ListCardBase.module.css'
import { DraggableProvidedDraggableProps } from '@hello-pangea/dnd'

interface ListCardProps {
  handleOutsideClick?: () => void
  innerRef?: (a?: HTMLElement | null) => void
  draggableProps?: DraggableProvidedDraggableProps
}

function ListCardBase({
  handleOutsideClick,
  innerRef,
  draggableProps,
  children,
}: Readonly<PropsWithChildren<ListCardProps>>) {
  const outsideClickRef = useClickOutside(handleOutsideClick || (() => {}))
  const mergedRef = useMergedRef(outsideClickRef, innerRef)

  return (
    <Card
      className={classes.card}
      withBorder
      w={LIST_WIDTH}
      radius='lg'
      shadow='md'
      p='sm'
      mah={LIST_MAX_HEIGHT}
      ref={mergedRef}
      {...draggableProps}
    >
      {children}
    </Card>
  )
}

export default ListCardBase

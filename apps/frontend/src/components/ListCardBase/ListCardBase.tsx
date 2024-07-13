import { Card } from '@mantine/core'
import { useClickOutside, useMergedRef } from '@mantine/hooks'
import { LIST_MAX_HEIGHT, LIST_WIDTH } from 'consts/style-consts'
import { PropsWithChildren } from 'react'
import classes from './ListCardBase.module.css'

interface ListCardProps {
  handleOutsideClick?: () => void
}

function ListCardBase({
  handleOutsideClick,
  children,
}: Readonly<PropsWithChildren<ListCardProps>>) {
  const outsideClickRef = useClickOutside(handleOutsideClick || (() => {}))
  const mergedRef = useMergedRef(outsideClickRef)

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
    >
      {children}
    </Card>
  )
}

export default ListCardBase

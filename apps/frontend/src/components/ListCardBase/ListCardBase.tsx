import { Card } from '@mantine/core'
import { useClickOutside } from '@mantine/hooks'
import { LIST_MAX_HEIGHT, LIST_WIDTH } from 'consts/style-consts'
import { ReactNode } from 'react'
import classes from './ListCardBase.module.css'

interface ListCardProps {
  handleOutsideClick?: () => void
  children: ReactNode
}

function ListCardBase({ handleOutsideClick, children }: Readonly<ListCardProps>) {
  const ref = useClickOutside(handleOutsideClick || (() => {}))

  return (
    <Card
      className={classes.card}
      withBorder
      w={LIST_WIDTH}
      radius='lg'
      shadow='md'
      p='sm'
      mah={LIST_MAX_HEIGHT}
      ref={ref}
    >
      {children}
    </Card>
  )
}

export default ListCardBase

import { Card, useMantineColorScheme, useMantineTheme } from '@mantine/core'
import { useClickOutside } from '@mantine/hooks'
import { LIST_WIDTH } from 'consts/style-consts'
import { ReactNode } from 'react'

interface ListCardProps {
  handleOutsideClick?: () => void
  children: ReactNode
}

function ListCardBase({ handleOutsideClick, children }: Readonly<ListCardProps>) {
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()

  const ref = useClickOutside(handleOutsideClick || (() => {}))

  return (
    <Card
      bg={colorScheme == 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}
      w={LIST_WIDTH}
      radius='lg'
      ref={ref}
    >
      {children}
    </Card>
  )
}

export default ListCardBase

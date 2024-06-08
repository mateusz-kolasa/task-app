import { Card } from '@mantine/core'
import { useClickOutside } from '@mantine/hooks'
import { ReactNode } from 'react'

interface TaskCardProps {
  handleOutsideClick?: () => void
  children: ReactNode
}

function TaskCardBase({ handleOutsideClick, children }: Readonly<TaskCardProps>) {
  const ref = useClickOutside(handleOutsideClick || (() => {}))

  return (
    <Card radius='lg' ref={ref}>
      {children}
    </Card>
  )
}

export default TaskCardBase

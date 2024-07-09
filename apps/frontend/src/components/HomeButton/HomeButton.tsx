import { Button } from '@mantine/core'
import { IconLayoutDashboard } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'

function HomeButton() {
  const navigate = useNavigate()

  const handleClick = () => navigate('/dashboard')

  return (
    <Button
      ml='md'
      variant='subtle'
      size='md'
      leftSection={<IconLayoutDashboard />}
      onClick={handleClick}
    >
      Task App
    </Button>
  )
}

export default HomeButton

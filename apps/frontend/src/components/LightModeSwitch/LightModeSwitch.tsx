import { Switch, rem, useMantineColorScheme, useMantineTheme } from '@mantine/core'
import { IconSun, IconMoonStars } from '@tabler/icons-react'
import { ChangeEvent } from 'react'
import classes from './LightModeSwitch.module.css'

function LightModeSwitch() {
  const theme = useMantineTheme()
  const { colorScheme, setColorScheme } = useMantineColorScheme()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target
    setColorScheme(checked ? 'dark' : 'light')
  }

  return (
    <Switch
      size='lg'
      checked={colorScheme === 'dark'}
      onChange={handleChange}
      classNames={{
        root: classes.root,
        track: classes.cursor,
      }}
      onLabel={
        <IconSun
          style={{ width: rem(24), height: rem(24) }}
          stroke={2.5}
          color={theme.colors.yellow[4]}
        />
      }
      offLabel={
        <IconMoonStars
          style={{ width: rem(24), height: rem(24) }}
          stroke={2.5}
          color={theme.colors.blue[6]}
        />
      }
    />
  )
}

export default LightModeSwitch

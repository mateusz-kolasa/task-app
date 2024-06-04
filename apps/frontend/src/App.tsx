import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { AppShell, MantineProvider } from '@mantine/core'
import { theme } from './theme'
import { Router } from './Router'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { Notifications } from '@mantine/notifications'

function App() {
  return (
    <MantineProvider theme={theme} forceColorScheme='light'>
      <Notifications />
      <Provider store={store}>
        <AppShell header={{ height: 60 }} padding='md'>
          <AppShell.Header></AppShell.Header>
          <AppShell.Main style={{ alignContent: 'center' }}>
            <Router />
          </AppShell.Main>
        </AppShell>
      </Provider>
    </MantineProvider>
  )
}

export default App

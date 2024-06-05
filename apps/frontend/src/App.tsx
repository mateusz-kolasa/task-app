import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { AppShell, MantineProvider } from '@mantine/core'
import { theme } from './theme'
import { Router } from './Router'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { Notifications } from '@mantine/notifications'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en/translation.json'
import pl from '../locales/pl/translation.json'
import LanguageDetector from 'i18next-browser-languagedetector'
import Header from './components/Header/Header'

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      pl: {
        translation: pl,
      },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

function App() {
  return (
    <MantineProvider theme={theme} forceColorScheme='light'>
      <Notifications />
      <Provider store={store}>
        <AppShell header={{ height: 60 }} padding='md'>
          <AppShell.Header style={{ alignContent: 'center' }}>
            <Header />
          </AppShell.Header>
          <AppShell.Main style={{ alignContent: 'center' }}>
            <Router />
          </AppShell.Main>
        </AppShell>
      </Provider>
    </MantineProvider>
  )
}

export default App

import { MantineProvider } from '@mantine/core';
import './App.css';
import '@mantine/core/styles.css';
import { theme } from './theme';
import { Router } from './Router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <MantineProvider theme={theme} forceColorScheme="light">
      <QueryClientProvider client={queryClient}>
        <Router />
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default App;

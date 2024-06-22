import { MantineProvider } from '@mantine/core'
import { PropsWithChildren } from 'react'
import { RenderOptions, render } from '@testing-library/react'
import { Notifications } from '@mantine/notifications'
import { Provider } from 'react-redux'
import { AppStore, RootState, setupStore } from 'store/store'
import { BrowserRouter } from 'react-router-dom'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import { vi } from 'vitest'

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>
  store?: AppStore
}

export function customRender(
  ui: React.ReactElement,
  extendedRenderOptions: ExtendedRenderOptions = {}
) {
  const {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    ...renderOptions
  } = extendedRenderOptions

  const Wrapper = ({ children }: PropsWithChildren) => (
    <MantineProvider defaultColorScheme='light'>
      <Notifications />
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    </MantineProvider>
  )

  // Return an object with the store and all of RTL's query functions
  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

export function TestDragAndDropContext({ children }: Readonly<PropsWithChildren>) {
  const onDragEnd = vi.fn()

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId='droppable'>
        {provided => (
          <>
            {children}
            {provided.placeholder}
          </>
        )}
      </Droppable>
    </DragDropContext>
  )
}

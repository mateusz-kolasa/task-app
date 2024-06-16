import { AppShell } from '@mantine/core'
import Header from 'components/Header/Header'
import { PropsWithChildren, ReactNode } from 'react'

interface BaseLayoutProps {
  SpecialHeader?: ReactNode
  Aside?: ReactNode
  isAsideCollapsed?: boolean
}

function BaseLayout({
  SpecialHeader,
  Aside,
  isAsideCollapsed = true,
  children,
}: Readonly<PropsWithChildren<BaseLayoutProps>>) {
  return (
    <AppShell
      header={{ height: 60 }}
      padding='md'
      aside={{
        width: 400,
        breakpoint: 600,
        collapsed: { desktop: isAsideCollapsed, mobile: isAsideCollapsed },
      }}
    >
      <AppShell.Header style={{ alignContent: 'center' }}>
        {SpecialHeader || <Header />}
      </AppShell.Header>
      <AppShell.Main style={{ alignContent: 'center' }}>{children}</AppShell.Main>
      {Aside && <AppShell.Aside>{Aside}</AppShell.Aside>}
    </AppShell>
  )
}

export default BaseLayout

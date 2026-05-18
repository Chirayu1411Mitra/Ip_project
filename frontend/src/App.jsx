import React from 'react'
import AppRoute from './Router/AppRoute'
import { AuthProvider } from './context/AuthContext'
import { NotifProvider } from './context/NotifContext'
import { SocketProvider } from './context/SocketContext'

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotifProvider>
          <AppRoute />
        </NotifProvider>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
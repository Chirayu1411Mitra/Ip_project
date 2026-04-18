import React from 'react'
import AppRoute from './Router/AppRoute'
import { AuthProvider } from './context/AuthContext'
import { NotifProvider } from './context/NotifContext'

const App = () => {
  return (
    <AuthProvider>
      <NotifProvider>
        <AppRoute />
      </NotifProvider>
    </AuthProvider>
  )
}

export default App
import React from 'react'
import AppRoute from './Router/AppRoute'
import { AuthProvider } from './context/AuthContext'

  const App = () => {
    return (
      <AuthProvider>
        <AppRoute />
      </AuthProvider>
    )
}

export default App
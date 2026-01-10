import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Dictation from './pages/Dictation'

function App() {
    const { isAuthenticated } = useAuthStore()
    const { theme } = useThemeStore()

    // Initialize theme on app load
    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(theme)
    }, [theme])

    return (
        <Routes>
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
            />
            <Route
                path="/dashboard"
                element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
                path="/dictation/:caseId"
                element={isAuthenticated ? <Dictation /> : <Navigate to="/login" />}
            />
            <Route
                path="/"
                element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
            />
        </Routes>
    )
}

export default App

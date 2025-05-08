import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from './store' // или '@/store' если у тебя настроен alias

import LoginPage from './pages/LoginPage'
import TasksPage from './pages/TasksPage'
import { UsersPage } from './pages/UsersPage'
import React from 'react'

export default function App() {
    const currentUserId = useSelector((state: RootState) => state.auth.user?.id)

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route
                path="*"
                element={<Navigate to={currentUserId ? '/tasks' : '/login'} replace />}
            />
        </Routes>
    )
}

import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from './store' // или '@/store' если у тебя настроен alias

import LoginPage from './pages/LoginPage'
import TasksPage from './pages/TasksPage'
import { UsersPage } from './pages/UsersPage'
import React from 'react'
import OrganizerPage from "@/pages/OrganizerPage";

export default function App() {
    const currentUserId = useSelector((state: RootState) => state.auth.user?.id)

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<OrganizerPage />} />
            <Route
                path="*"
                element={<Navigate to={currentUserId ? '/' : '/login'} replace />}
            />
        </Routes>
    )
}

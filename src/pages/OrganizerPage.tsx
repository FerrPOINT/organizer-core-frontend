import { useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import LoginPage from './LoginPage'
import TasksPage from './TasksPage'
import { UsersPage } from './UsersPage'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import React from 'react'

export default function OrganizerPage() {
    const currentUser = useSelector((state: RootState) => state.auth.user)
    const [activeTab, setActiveTab] = useState<'users' | 'tasks'>('tasks')

    if (!currentUser?.id) return <LoginPage />

    return (
        <div className="min-h-screen p-6">
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'users' | 'tasks')}>
                <TabsList className="mb-4">
                    <TabsTrigger value="tasks">Задачи</TabsTrigger>
                    <TabsTrigger value="users">Пользователи</TabsTrigger>
                </TabsList>

                <TabsContent value="tasks">
                    <TasksPage />
                </TabsContent>

                <TabsContent value="users">
                    <UsersPage />
                </TabsContent>
            </Tabs>
        </div>
    )
}

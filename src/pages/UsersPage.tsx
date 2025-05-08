// UsersPage.tsx — обновлённая версия под shadcn/ui
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { UsersService } from '../client/services/UsersService'
import { UserCreate, UserOut, UserUpdate } from '../client'
import { UserFormModal } from './UserFormModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// npx shadcn@latest add badge table
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import React from 'react'

export const UsersPage = () => {
    const currentUser = useSelector((state: any) => state.auth.user)
    const navigate = useNavigate()

    const [users, setUsers] = useState<UserOut[]>([])
    const [loading, setLoading] = useState(false)
    const [editingUser, setEditingUser] = useState<UserOut | null>(null)
    const [modalOpen, setModalOpen] = useState(false)

    const fetchUsers = async () => {
        if (currentUser.role !== 'admin') {
            navigate('/tasks')
            return
        }
        setLoading(true)
        try {
            const res = await UsersService.listUsersUsersGet()
            setUsers(res)
        } catch (e) {
            console.error('Ошибка при загрузке пользователей:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleCreate = async (data: UserCreate) => {
        try {
            await UsersService.createUserUsersPost(data)
            await fetchUsers()
            setModalOpen(false)
        } catch (e) {
            console.error('Ошибка при создании пользователя:', e)
            throw e // пробрасываем ошибку обратно в UserFormModal
        }
    }

    const handleUpdate = async (data: UserUpdate) => {
        if (!editingUser) return
        try {
            await UsersService.updateUserUsersPut(data)
            await fetchUsers()
            setEditingUser(null)
            setModalOpen(false)
        } catch (e) {
            console.error('Ошибка при обновлении пользователя:', e)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await UsersService.deleteUserUsersUserIdDelete(id)
            await fetchUsers()
        } catch (e) {
            console.error('Ошибка при удалении пользователя:', e)
        }
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="text-2xl">Пользователи</CardTitle>
                    <Button onClick={() => {
                        setEditingUser(null)
                        setModalOpen(true)
                    }}>
                        + Новый пользователь
                    </Button>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="text-muted-foreground">Загрузка...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Имя</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Роль</TableHead>
                                    <TableHead>Активен</TableHead>
                                    <TableHead>Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge>{user.role}</Badge>
                                        </TableCell>
                                        <TableCell>{user.is_active ? '✅' : '❌'}</TableCell>
                                        <TableCell className="space-x-2">
                                            <Button size="sm" variant="outline" onClick={() => {
                                                setEditingUser(user)
                                                setModalOpen(true)
                                            }}>
                                                ✏️
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}>
                                                🗑️
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {modalOpen && (
                <UserFormModal
                    initial={editingUser}
                    onSubmit={editingUser ? handleUpdate : handleCreate}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    )
}

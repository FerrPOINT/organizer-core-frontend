import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { UsersService } from '../client/services/UsersService'
import { UserCreate, UserOut, UserUpdate } from '../client'
import { UserFormModal } from './UserFormModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import React from 'react'

const ROLE_LABELS: Record<string, string> = {
    student: 'Ученик',
    teacher: 'Учитель',
    manager: 'Менеджер',
    admin: 'Админ',
}

const ROLE_COLORS: Record<string, string> = {
    student: 'bg-blue-500',
    teacher: 'bg-yellow-500',
    manager: 'bg-emerald-500',
    admin: 'bg-red-500',
}

const truncate = (text: string, maxLength = 20) =>
    text.length > maxLength ? text.slice(0, maxLength) + '…' : text

const PAGE_SIZE = 10

export const UsersPage = () => {
    const currentUser = useSelector((state: any) => state.auth.user)
    const navigate = useNavigate()

    const [users, setUsers] = useState<UserOut[]>([])
    const [loading, setLoading] = useState(false)
    const [editingUser, setEditingUser] = useState<UserOut | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [deletingUser, setDeletingUser] = useState<UserOut | null>(null)
    const [page, setPage] = useState(0)
    const [totalCount, setTotalCount] = useState<number>(0)
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'is_active'>('name')
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

    const sortedUsers = [...users].sort((a, b) => {
        let aVal: string | number = '';
        let bVal: string | number = '';

        if (sortBy === 'is_active') {
            aVal = a.is_active ? 1 : 0;
            bVal = b.is_active ? 1 : 0;
        } else {
            aVal = a[sortBy] ?? '';
            bVal = b[sortBy] ?? '';
        }

        return sortDir === 'asc'
            ? String(aVal).localeCompare(String(bVal))
            : String(bVal).localeCompare(String(aVal));
    });


    const toggleSort = (column: 'name' | 'email' | 'role'| 'is_active') => {
        if (sortBy === column) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(column)
            setSortDir('asc')
        }
    }

    const fetchUsers = async () => {
        if (currentUser.role !== 'admin') {
            navigate('/tasks')
            return
        }
        setLoading(true)
        try {
            const res = await UsersService.listUsersUsersGet(page * PAGE_SIZE, PAGE_SIZE)
            const count = +(res as any).headers?.['x-total-count'] || 1000 // fallback to 1000 if header missing
            setTotalCount(count)
            setUsers(res as UserOut[])
        } catch (e) {
            console.error('Ошибка при загрузке пользователей:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [page])

    const handleCreate = async (data: UserCreate) => {
        try {
            await UsersService.createUserUsersPost(data)
            await fetchUsers()
            setModalOpen(false)
        } catch (e) {
            console.error('Ошибка при создании пользователя:', e)
            throw e
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

    const handleDeleteConfirmed = async () => {
        if (!deletingUser) return
        try {
            await UsersService.deleteUserUsersUserIdDelete(deletingUser.id)
            await fetchUsers()
        } catch (e) {
            console.error('Ошибка при удалении пользователя:', e)
        } finally {
            setDeletingUser(null)
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Card className="rounded-2xl border bg-card shadow-xl">
                <CardHeader className="flex flex-row justify-between items-center px-6 py-4">
                    <CardTitle className="text-2xl font-semibold">Пользователи</CardTitle>
                    <Button onClick={() => {
                        setEditingUser(null)
                        setModalOpen(true)
                    }} className="rounded-lg">
                        + Новый пользователь
                    </Button>
                </CardHeader>

                <CardContent className="px-6 pb-6">
                    {loading ? (
                        <div className="text-muted-foreground py-4">Загрузка...</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                                                Имя {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                                            </TableHead>
                                            <TableHead className="cursor-pointer" onClick={() => toggleSort('email')}>
                                                Email {sortBy === 'email' && (sortDir === 'asc' ? '↑' : '↓')}
                                            </TableHead>
                                            <TableHead className="cursor-pointer" onClick={() => toggleSort('role')}>
                                                Роль {sortBy === 'role' && (sortDir === 'asc' ? '↑' : '↓')}
                                            </TableHead>
                                            <TableHead className="w-24 text-center cursor-pointer" onClick={() => toggleSort('is_active')}>
                                                Активен {sortBy === 'is_active' && (sortDir === 'asc' ? '↑' : '↓')}
                                            </TableHead>
                                            <TableHead className="w-32 text-right">Действия</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedUsers.map(user => (
                                            <TableRow key={user.id} className="hover:bg-muted/10 transition">
                                                <TableCell>{truncate(user.name)}</TableCell>
                                                <TableCell className="text-muted-foreground">{truncate(user.email)}</TableCell>
                                                <TableCell>
                                                    <Badge className={`text-white ${ROLE_COLORS[user.role]} hover:bg-inherit`}>{ROLE_LABELS[user.role] ?? user.role}</Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {user.is_active ? <span className="text-green-500">●</span> : <span className="text-red-500">●</span>}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="rounded-md"
                                                        onClick={() => {
                                                            setEditingUser(user)
                                                            setModalOpen(true)
                                                        }}
                                                    >
                                                        ✏️
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="rounded-md"
                                                        onClick={() => setDeletingUser(user)}
                                                    >
                                                        🗑️
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <Pagination className="justify-between pt-4 items-center">
                <span className="text-sm text-muted-foreground">
                  Страница {page + 1}
                </span>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setPage(p => Math.max(p - 1, 0))}
                                            aria-disabled={page === 0}
                                        />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setPage(p => (page + 1 < Math.ceil(totalCount / PAGE_SIZE) ? p + 1 : p))}
                                            aria-disabled={page + 1 >= Math.ceil(totalCount / PAGE_SIZE)}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </>
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

            {deletingUser && (
                <Dialog open onOpenChange={() => setDeletingUser(null)}>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Удалить пользователя?</DialogTitle>
                        </DialogHeader>
                        <div className="text-sm text-muted-foreground">
                            Вы уверены, что хотите удалить пользователя <b>{deletingUser.name}</b>?
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="ghost" onClick={() => setDeletingUser(null)}>
                                Отмена
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteConfirmed}>
                                Удалить
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

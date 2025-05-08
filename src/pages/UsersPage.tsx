// UsersPage.tsx
import {useEffect, useState} from 'react';
import {UsersService} from '../client/services/UsersService';
import {UserCreate, UserOut, UserUpdate} from '../client';
import {UserFormModal} from './UserFormModal';
import {useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import React from 'react';

export const UsersPage = () => {
    const currentUser = useSelector((state: any) => state.auth.user);
    console.info('Пользователь: %d', currentUser.id);
    const [users, setUsers] = useState<UserOut[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingUser, setEditingUser] = useState<UserOut | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();

    // Загружает список пользователей с сервера
    const fetchUsers = async () => {
        if (currentUser.role != 'admin') {
            navigate('/tasks');
        }
        setLoading(true);
        try {
            const res = await UsersService.listUsersUsersGet();
            setUsers(res);
        } catch (error) {
            console.error('Ошибка при загрузке пользователей:', error);
            alert('Не удалось загрузить список пользователей.');
        } finally {
            setLoading(false);
        }
    };

    // Один раз при монтировании загружаем список
    useEffect(() => {
        fetchUsers();
    }, []);

    // Создание нового пользователя
    const handleCreate = async (data: UserCreate) => {
        try {
            await UsersService.createUserUsersPost(data);
            await fetchUsers();
            setModalOpen(false)
        } catch (error) {
            console.error('Ошибка при создании пользователя:', error);
            alert('Не удалось создать пользователя. Проверьте введённые данные.');
        }
    };

    // Обновление существующего пользователя
    const handleUpdate = async (data: UserUpdate) => {
        if (!editingUser) return;
        try {
            await UsersService.updateUserUsersPut(data);
            setEditingUser(null);
            await fetchUsers();
            setModalOpen(false)
        } catch (error) {
            console.error('Ошибка при обновлении пользователя:', error);
            alert('Не удалось обновить пользователя. Проверьте введённые данные.');
        }
    };

    // Удаление пользователя
    const handleDelete = async (id: number) => {
        try {
            await UsersService.deleteUserUsersUserIdDelete(id);
            await fetchUsers();
        } catch (error) {
            console.error('Ошибка при удалении пользователя:', error);
            alert('Не удалось удалить пользователя.');
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Пользователи</h1>

            <button className="btn btn-primary mb-2" onClick={() => {
                setEditingUser(null);
                setModalOpen(true);
            }}>
                + Новый пользователь
            </button>

            {loading ? (
                <div>Загрузка...</div>
            ) : (
                <table className="table-auto w-full border">
                    <thead>
                    <tr>
                        <th>Имя</th>
                        <th>Email</th>
                        <th>Роль</th>
                        <th>Активен</th>
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="border-t">
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.is_active ? '✅' : '❌'}</td>
                            <td>
                                <button onClick={() => {
                                    setEditingUser(user);
                                    setModalOpen(true);
                                }}>✏️
                                </button>
                                <button onClick={() => handleDelete(user.id)}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {modalOpen && (
                <UserFormModal
                    initial={editingUser}
                    onSubmit={(values) => {
                        editingUser
                            ? handleUpdate(values as UserUpdate)
                            : handleCreate(values as UserCreate)
                    }
                    }
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
};

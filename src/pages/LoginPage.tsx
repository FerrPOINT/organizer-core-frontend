import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {OpenAPI} from '../client/core/OpenAPI';
import {DefaultService, UsersService} from '../client';
import {setUser} from "../features/authSlice";
import {useDispatch} from 'react-redux';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    OpenAPI.BASE = 'http://localhost:8000'; // заменить при деплое
    const dispatch = useDispatch();

    const handleLogin = async () => {
        try {
            const res = await DefaultService.loginTokenPost({username, password});
            localStorage.setItem('access_token', res.access_token);
            // конфигурируем OpenAPI глобально
            OpenAPI.TOKEN = () => Promise.resolve(res.access_token);

            const user = await UsersService.readUserUsersUserIdGet(res.user_id);

            dispatch(setUser({
                id: user.id,
                email: user.email || 'undefined',
                name: user.name || 'undefined',
                role: user.role || 'undefined',
            }));

            navigate('/users');
        } catch (e) {
            console.error('Ошибка авторизации:', e);
            setError('Неверный логин или пароль');
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-4xl text-red-600">Авторизация</h1>
            <input
                type="text"
                placeholder="Логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mb-3 border p-2 w-full"
            />
            <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-3 border p-2 w-full"
            />
            <button
                onClick={handleLogin}
                className="bg-blue-500 text-white px-4 py-2 rounded w-full"
            >
                Войти
            </button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
    );
}

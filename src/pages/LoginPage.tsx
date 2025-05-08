import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OpenAPI } from '../client/core/OpenAPI'
import { DefaultService, UsersService } from '../client'
import { setUser } from '../features/authSlice'
import React from 'react'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const dispatch = useDispatch()

    // при загрузке страницы — подставить логин и пароль из localStorage
    useEffect(() => {
        const savedUsername = localStorage.getItem('saved_username') || ''
        const savedPassword = localStorage.getItem('saved_password') || ''
        setUsername(savedUsername)
        setPassword(savedPassword)
    }, [])

    const handleLogin = async () => {
        try {
            OpenAPI.BASE = 'http://localhost:8000'

            // сохранить логин/пароль
            localStorage.setItem('saved_username', username)
            localStorage.setItem('saved_password', password)

            const res = await DefaultService.loginTokenPost({ username, password })
            localStorage.setItem('access_token', res.access_token)
            OpenAPI.TOKEN = () => Promise.resolve(res.access_token)

            const user = await UsersService.readUserUsersUserIdGet(res.user_id)

            dispatch(
                setUser({
                    id: user.id,
                    email: user.email || '',
                    name: user.name || '',
                    role: user.role || '',
                })
            )

            navigate('/users')
        } catch (e) {
            console.error('Ошибка авторизации:', e)
            setError('Неверный логин или пароль')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Вход в систему</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="Логин"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <div className="text-sm text-red-500">{error}</div>}
                    <Button onClick={handleLogin} className="w-full">
                        Войти
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

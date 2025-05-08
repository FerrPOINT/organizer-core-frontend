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

    useEffect(() => {
        const savedUsername = localStorage.getItem('saved_username') || ''
        const savedPassword = localStorage.getItem('saved_password') || ''
        setUsername(savedUsername)
        setPassword(savedPassword)
    }, [])

    const handleLogin = async () => {
        try {
            OpenAPI.BASE = 'http://localhost:8000'

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
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md border rounded-xl shadow-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-2xl text-center font-semibold tracking-tight">
                        Вход в систему
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            placeholder="Логин"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="h-10"
                        />
                        <Input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-10"
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md border border-destructive">
                            {error}
                        </div>
                    )}

                    <Button onClick={handleLogin} className="w-full h-10 text-md font-medium">
                        Войти
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
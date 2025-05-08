// UserFormModal.tsx — с валидацией, автофокусом, сохранением роли, FormWrapper из shadcn/ui
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { UserCreate, UserUpdate, UserOut } from '../client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import React from 'react'

interface Props {
    initial?: UserOut | null
    onSubmit: (values: UserCreate | UserUpdate) => Promise<void>
    onClose: () => void
}

function mapUserOutToUserUpdate(user: UserOut): UserUpdate {
    return {
        ...user,
        password: '',
    }
}

export const UserFormModal = ({ initial, onSubmit, onClose }: Props) => {
    const isEdit = !!initial?.id
    const [submitError, setSubmitError] = useState<string | null>(null)

    const form = useForm<UserCreate>({
        mode: 'onChange',
        defaultValues: {
            name: '',
            email: '',
            password: '',
            is_active: true,
            role: 'student',
        },
    })

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isValid },
    } = form

    useEffect(() => {
        if (initial) {
            const { id, ...data } = mapUserOutToUserUpdate(initial)
            reset({
                name: data.name ?? '',
                email: data.email ?? '',
                role: data.role ?? 'student',
                password: '',
                is_active: data.is_active ?? true,
            })
        } else {
            const savedRole = localStorage.getItem('last_role') || 'student'
            setValue('role', savedRole as UserCreate['role'])
        }
    }, [initial, reset, setValue])

    const handleFormSubmit = async (values: UserCreate) => {
        try {
            setSubmitError(null)
            localStorage.setItem('last_role', values.role)
            if (isEdit && initial?.id !== undefined) {
                const { password, ...rest } = values;
                const payload = password ? { ...rest, password, id: initial.id } : { ...rest, id: initial.id };
                await onSubmit(payload)
            } else {
                await onSubmit(values)
            }
        } catch (e: any) {
            console.error('Ошибка при отправке формы:', e)

            const detail =
                e?.response?.data?.detail ||
                e?.body?.detail ||
                e?.message ||
                'Ошибка при сохранении пользователя. Попробуйте ещё раз.'

            if (Array.isArray(detail)) {
                setSubmitError(detail.map((d: any) => d.msg).join('; '))
            } else {
                setSubmitError(typeof detail === 'string' ? detail : 'Неизвестная ошибка')
            }
            throw e
        }
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Редактировать пользователя' : 'Создать пользователя'}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Имя</FormLabel>
                                    <FormControl>
                                        <Input autoFocus {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {!isEdit && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Пароль</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />)}

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Роль</FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Выберите роль" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="student">Ученик</SelectItem>
                                            <SelectItem value="teacher">Учитель</SelectItem>
                                            <SelectItem value="manager">Менеджер</SelectItem>
                                            <SelectItem value="admin">Админ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center gap-2">
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            id="is_active"
                                        />
                                    </FormControl>
                                    <FormLabel htmlFor="is_active">Активен</FormLabel>
                                </FormItem>
                            )}
                        />

                        {submitError && <p className="text-sm text-red-500">{submitError}</p>}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="submit" disabled={!isValid}>
                                {isEdit ? 'Сохранить' : 'Создать'}
                            </Button>
                            <Button type="button" variant="secondary" onClick={onClose}>
                                Отмена
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

// UserFormModal.tsx
import { Dialog } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import type { UserCreate, UserUpdate, UserOut } from '../client/index';
import { useEffect } from 'react';

type Props = {
  initial?: UserOut | null;
  onSubmit: (values: UserCreate | UserUpdate) => void;
  onClose: () => void;
};

function mapUserOutToUserUpdate(user: UserOut): UserUpdate {
  return {
    ...user,
    password: '', // 👈 добавляем обязательное поле
  };
}

export const UserFormModal = ({ initial, onSubmit, onClose }: Props) => {
  const isEdit = !!initial?.id;

  const { register, handleSubmit, reset } = useForm<UserCreate>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      is_active: true,
      role: 'student',
    },
  });

  useEffect(() => {
    if (initial) {
      const { id, ...data } = mapUserOutToUserUpdate(initial); // 👈 безопасно
      reset({
        name: data.name ?? '',
        email: data.email ?? '',
        role: data.role ?? 'student',
        password: undefined, // всегда очищаем
        is_active: data.is_active ?? true,
      });
    }
  }, [initial, reset]);

  const handleFormSubmit = (values: UserCreate) => {
    if (isEdit && initial?.id !== undefined) {
      onSubmit({ ...values, id: initial.id }); // безопасно кастится в UserUpdate
    } else {
      onSubmit(values);
    }
  };

  return (
      <Dialog open={true} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center">
        <div className="fixed inset-0 bg-black opacity-30" />
        <Dialog.Panel className="bg-white rounded-lg shadow p-6 z-50 max-w-md w-full">
          <Dialog.Title className="text-lg font-bold mb-4">
            {isEdit ? 'Редактировать пользователя' : 'Создать пользователя'}
          </Dialog.Title>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Имя</label>
              <input {...register('name', { required: true })} className="w-full input input-bordered" />
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <input type="email" {...register('email')} className="w-full input input-bordered" />
            </div>

            <div>
              <label className="block text-sm font-medium">Роль</label>
              <select {...register('role')} className="w-full input input-bordered">
                <option value="student">Ученик</option>
                <option value="teacher">Учитель</option>
                <option value="manager">Менеджер</option>
                <option value="admin">Админ</option>
              </select>
            </div>

            {!isEdit && (
                <div>
                  <label className="block text-sm font-medium">Пароль</label>
                  <input
                      type="password"
                      {...register('password', { required: true })}
                      className="w-full input input-bordered"
                  />
                </div>
            )}

            <div className="flex items-center space-x-2">
              <input type="checkbox" {...register('is_active')} id="is_active" />
              <label htmlFor="is_active">Активен</label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button type="submit" className="btn btn-primary">
                {isEdit ? 'Сохранить' : 'Создать'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Отмена
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </Dialog>
  );
};

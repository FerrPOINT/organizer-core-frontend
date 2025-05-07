import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OpenAPI } from '../client/core/OpenAPI';

export default function TasksPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const token = OpenAPI.TOKEN;
            if (!token) {
                navigate('/login');
            }
        };
        checkAuth();
    }, [navigate]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Мои задачи</h1>
            <p className="text-gray-600">Здесь появятся задачи пользователя.</p>
        </div>
    );
}

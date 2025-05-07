import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';

import LoginPage from './pages/LoginPage';
import TasksPage from './pages/TasksPage';
import { UsersPage } from './pages/UsersPage';

function App() {
    const currentUserId = useSelector((state: any) => state.auth.user?.id);

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="*" element={<LoginPage />} />
        </Routes>
    );
}

export default App;

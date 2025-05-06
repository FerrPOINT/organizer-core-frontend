import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import TasksPage from './pages/TasksPage';

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="*" element={<LoginPage />} />
        </Routes>
    );
}

export default App;
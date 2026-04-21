import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import JobsRealMain from './pages/JobsRealMain';
import JobsLoginRegister from './pages/JobsLoginRegister';
import JobsAccount from "../src/pages/JobsAccount";
import JobsCatalog from "./pages/JobsCatalog";
import JobsAdmin from "./pages/JobsAdmin";
import VacDetails from "./pages/VacDetails";
import ResumeDetails from "./pages/ResumeDetails";
import './App.css';

function App() {
    const [user, setUser] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false); // Переименовал для ясности

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsInitialized(true); // Просто отмечаем, что инициализация завершена
    }, []);

    const handleLoginSuccess = (userData) => {
        setUser(userData);
    };

    const handleRegisterSuccess = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        setUser(null);
    };

    const ProtectedRoute = ({ children }) => {
        if (!isInitialized) return null; // Ничего не показываем во время инициализации
        if (!user) return <Navigate to="/login" replace />;
        return children;
    };

    const AdminRoute = ({ children }) => {
        if (!isInitialized) return null;
        if (!user || user.user_type !== 'admin') return <Navigate to="/" replace />;
        return children;
    };

    // Во время инициализации показываем пустой div (без текста)
    if (!isInitialized) {
        return <div style={{ minHeight: '100vh' }}></div>;
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<JobsRealMain user={user} onLogout={handleLogout}/>} />
                <Route path="/login" element={
                    !user ? <JobsLoginRegister onLoginSuccess={handleLoginSuccess} onRegisterSuccess={handleRegisterSuccess}/> : <Navigate to="/" replace />
                } />
                <Route path="/catalog" element={<JobsCatalog user={user} onLogout={handleLogout}/>} />
                <Route path="/account" element={
                    user?.user_type !== 'admin' ? (
                        <ProtectedRoute>
                            <JobsAccount user={user} onLogout={handleLogout}/>
                        </ProtectedRoute>
                    ) : (
                        <Navigate to="/admin" replace />
                    )
                } />
                <Route path="/admin" element={
                    <AdminRoute>
                        <JobsAdmin user={user} onLogout={handleLogout}/>
                    </AdminRoute>
                } />
                <Route path="/vacancy/:id" element={<VacDetails />} />
                <Route path="/resume/:id" element={<ResumeDetails />} />
            </Routes>
        </Router>
    );
}

export default App;
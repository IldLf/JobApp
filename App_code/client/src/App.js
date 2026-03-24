import React, {useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JobsRealMain from './components/JobsRealMain';
import JobsLoginRegister from './components/JobsLoginRegister';

import './App.css';

function App() {
    const [user, setUser] = useState(null);

    React.useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
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
    return (
        <Router>
            <Routes>
                <Route path="/" element={<JobsRealMain user={user} onLogout={handleLogout}/>} />
                <Route path="/login" element={<JobsLoginRegister onLoginSuccess={handleLoginSuccess} onRegisterSuccess={handleRegisterSuccess}/>} />
                {/* <Route path='/catalog' element={<JobsCatalog user={user} onLogout={handleLogout}/>} />
                <Route path='/account' element={<JobsAccount user={user} onLogout={handleLogout}/>} /> */}
            </Routes>
        </Router>
    );
}

export default App;
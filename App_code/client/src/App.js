import React, {useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JobsRealMain from './pages/JobsRealMain';
import JobsLoginRegister from './pages/JobsLoginRegister';
import './App.css';
import JobsAccount from "../src/pages/JobsAccount";
import JobsCatalog from "./pages/JobsCatalog";
import VacDetails from "./pages/VacDetails";

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
                <Route path="/catalog" element={<JobsCatalog user={user} onLogout={handleLogout}/>} />
                <Route path="/account" element={<JobsAccount user={user} onLogout={handleLogout}/>} />
                {/* <Route path='/catalog' element={<JobsCatalog user={user} onLogout={handleLogout}/>} />
                <Route path='/account' element={<JobsAccount user={user} onLogout={handleLogout}/>} /> */}
                <Route path="/vacancy/:id" element={<VacDetails />} />
            </Routes>
        </Router>
    );
}

export default App;
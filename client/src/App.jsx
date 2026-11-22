
import { Routes, Route, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { useAuth } from './context/authContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import VerifyOtp from './pages/VerifyOtp.jsx';
import Dashboard from './pages/Dashboard';


function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

                {/* Protected Routes */}
<Route path="/dashboard" element={user ? <Layout /> : <Navigate to="/login" />}>
    <Route index element={<Dashboard />} />
</Route> 
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import CreateUser from './pages/admin/users/Create';
import UserList from './pages/admin/users/List';
import MetersMain from './pages/meters/Main';
import RegisterMeter from './pages/meters/Register';
import RegisterConsumption from './pages/consumptions/Register';
import Today from './pages/consumptions/Today';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/consumptions/today" replace />} />
              <Route path="consumptions/register" element={<RegisterConsumption />} />
              <Route path="consumptions/today" element={<Today />} />
              <Route path="meters" element={<MetersMain />} />

              {/* Admin only */}
              <Route element={<ProtectedRoute allowedRoles={['Administrador']} />}>
                <Route path="meters/register" element={<RegisterMeter />} />
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/users" element={<UserList />} />
                <Route path="admin/users/create" element={<CreateUser />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

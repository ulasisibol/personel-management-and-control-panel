import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import Login from './components/Auth/Login';
import DashboardLayout from './components/Layout/DashboardLayout';
import AddUser from './components/User/AddUser';
import Dashboard from './pages/Dashboard';
import EmptyPage from './pages/EmptyPage';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import AddDepartment from './pages/AddDepartment';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/empty" element={<EmptyPage />} />
              
              <Route element={<AdminRoute />}>
                <Route path="/users/add" element={<AddUser />} />
                <Route path="/departments/add" element={<AddDepartment />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

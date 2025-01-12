import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import Login from './components/Auth/Login';
import DashboardLayout from './components/Layout/DashboardLayout';
import AddUser from './components/User/AddUser';
import AddPersonnel from './components/Personnel/AddPersonnel';
import ListPersonnel from './components/Personnel/ListPersonnel';
import Dashboard from './pages/Dashboard';
import EmptyPage from './pages/EmptyPage';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import AddDepartment from './components/Department/AddDepartment';
import DeleteUser from './components/User/DeleteUser';
import UpdateUser from './components/User/UpdateUser';
import DeleteDepartment from './components/Department/DeleteDepartment';
import ListUsers from './components/User/ListUsers';
import DeletePersonnel from './components/Personnel/DeletePersonel';
import UpdatePersonnel from './components/Personnel/UpdatePersonnel';
import PendingTasks from './components/Tasks/PendingTasks';
import ListTasks from './components/Tasks/ListTasks';
import AddTasks from './components/Tasks/AddTasks';
import ApprovedTasks from './components/Tasks/ApprovedTasks';
import ListAnnouncement from './components/Announcement/ListAnnouncement';
import CreateAnnouncement from './components/Announcement/CreateAnnouncement';
import ListShift from './components/Shifts/ShiftList';
import CreateShift from './components/Shifts/CreateShift';
import AssignPersonnel from './components/Shifts/AssignPersonnel';
import DeleteShift from './components/Shifts/DeleteShift';
import RemovePersonnel from './components/Shifts/RemovePersonnel';
import UpdateShift from './components/Shifts/UpdateShift';
import ExtraWorkManagement from './components/Additional/AddExtraShift';
import HolidayManagement from './components/Additional/AddHoliday';
import AbsenteeismManagement from './components/Additional/AbsenteeismManagement';
import CreateQuery from './components/AIQuery/CreateQuery';
import SavedQueries from './components/AIQuery/SavedQueries';
import DeleteQuery from './components/AIQuery/DeleteQuery';

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
              
              {/* Personel İşlemleri */}
              <Route path="/personnel/add" element={<AddPersonnel />} />
              <Route path="/personnel/list" element={<ListPersonnel />} />
              <Route path="/personnel/delete" element={<DeletePersonnel />} />
              <Route path="/personnel/update" element={<UpdatePersonnel />} />

              {/* Task İşlemleri */}
              <Route path="/tasks/pending" element={<PendingTasks />} />
              <Route path="/tasks/approved" element={<ApprovedTasks />} />
              <Route path="/tasks/list" element={<ListTasks />} />
              <Route path="/tasks/create" element={<AddTasks />} />

              {/* Shift İşlemleri */}
              <Route path="/shift/list" element={<ListShift />} />
              <Route path="/shift/create" element={<CreateShift />} />
              <Route path="/shift/assignPersonnel" element={<AssignPersonnel />} />
              <Route path="/shift/delete" element={<DeleteShift />} />
              <Route path="/shift/removePersonnel" element={<RemovePersonnel />} />
              <Route path="/shift/update" element={<UpdateShift />} />


              {/* Announcement İşlemleri */}
              <Route path="/announcement/list" element={<ListAnnouncement />} />
              <Route path="/announcement/create" element={<CreateAnnouncement />} />


              {/* Additional İşlemleri */}
              <Route path="/additional/extraShift" element={<ExtraWorkManagement />} />
              <Route path="/additional/addHoliday" element={<HolidayManagement />} />
              <Route path="/additional/absenteeism" element={<AbsenteeismManagement />} />


              {/* Admin İşlemleri */}
              <Route element={<AdminRoute />}>
                <Route path="/users/add" element={<AddUser />} />
                <Route path="/users/delete" element={<DeleteUser />} />
                <Route path="/users/update" element={<UpdateUser />} />
                <Route path="/users/list" element={<ListUsers />} />
                <Route path="/departments/add" element={<AddDepartment />} />
                <Route path="/departments/delete" element={<DeleteDepartment />} />
              </Route>

              <Route element={<AdminRoute />}>
                <Route path="/assistant/query" element={<CreateQuery />} /> 
                <Route path="/assistant/query/delete" element={<DeleteQuery />} /> 
              </Route>
              <Route path="/assistant/query/:id" element={<SavedQueries />} /> 
            </Route>
          </Route>


          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

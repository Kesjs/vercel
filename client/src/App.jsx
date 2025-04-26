import { Route, Routes } from 'react-router-dom';
import TicketForm from './TicketForm'; 
import MasterPage from './MasterPage';
import Login from './Login';  
import Register from './Register';  
import ProtectedRoute from './ProtectedRoute';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<TicketForm />} />
      
      {/* Route protégée */}
      <Route 
        path="/master" 
        element={
          <ProtectedRoute>
            <MasterPage />
          </ProtectedRoute>
        } 
      />
      
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;

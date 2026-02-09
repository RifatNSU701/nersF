import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Tenders from './pages/Tenders'; 
import Prices from './pages/Prices'; 
import Infrastructure from './pages/Infrastructure'; // <--- Import exists here

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        
        {/* Feature Routes */}
        <Route path="/tenders" element={<Tenders />} />
        <Route path="/prices" element={<Prices />} />
        <Route path="/infrastructure" element={<Infrastructure />} /> {/* <--- ADDED THIS LINE to fix the error */}

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
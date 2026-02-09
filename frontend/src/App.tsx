import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Tenders from './pages/Tenders'; // <--- 1. Import the new page

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        
        {/* Feature Routes */}
        <Route path="/tenders" element={<Tenders />} /> {/* <--- 2. Add the Route */}

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
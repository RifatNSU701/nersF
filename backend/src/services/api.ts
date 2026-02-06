import axios from 'axios';

// Create a single axios instance for the whole app
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Points to your Backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
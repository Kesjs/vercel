import React, { useState } from 'react';
import axios from 'axios';
import './index.css';

import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        username,
        password
      });

      if (response.status === 201) {
        navigate('/login');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur d\'inscription. Le serveur est peut-être hors ligne.';
      setError(message);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-white">CREATION DE  MOT DE PASSE</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleRegister}>
        <div className="mb-3">
          <input 
            type="text" 
            className="form-control bg-white"
            placeholder="Nom d'utilisateur" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required
          />
        </div>
        <div className="mb-3">
          <input 
            type="password" 
            className="form-control bg-white"
            placeholder="Mot de passe" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
        </div>
        <button type="submit" className="btn text-white fs-5">Créer</button>
      </form>
    </div>
  );
};

export default Register;

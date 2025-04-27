import React, { useState } from 'react';
import axios from 'axios';
import './index.css';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { motion } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); // démarre le loader

    try {
      const response = await axios.post('https://systeme-rjpm.onrender.com/api/register', {
        username,
        password
      });

      if (response.status === 201) {
        toast.success('Inscription réussie 🎉', {
          position: "top-center",
          autoClose: 2000,
        });

        setTimeout(() => {
          navigate('/login');
        }, 2500); // attendre un peu pour laisser apparaître la toast
      }
    } catch (err) {
      const message = err.response?.data?.message || "Erreur d'inscription. Le serveur est peut-être hors ligne.";
      setError(message);
    } finally {
      setLoading(false); // stoppe le loader
    }
  };

  return (
    <motion.div 
      className="container mt-5"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="mb-4 text-white">CRÉATION DE MOT DE PASSE</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleRegister}>
        <div className="mb-3">
          <input 
            type="text" 
            className="form-control"
            placeholder="Nom d'utilisateur" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required
          />
        </div>

        <div className="mb-3">
          <input 
            type="password" 
            className="form-control"
            placeholder="Mot de passe" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
        </div>

        <button type="submit" className="btn text-white fs-5" disabled={loading}>
          {loading ? 'Création en cours...' : 'Créer'}
        </button>
      </form>

      {/* Toast notifications */}
      <ToastContainer />
    </motion.div>
  );
};

export default Register;

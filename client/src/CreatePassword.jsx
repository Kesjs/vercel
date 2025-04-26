// CreatePassword.jsx
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

const CreatePassword = () => {
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handlePasswordSubmit = () => {
    if (password.length > 0) {
      // Sauvegarder le mot de passe dans le localStorage
      localStorage.setItem('passwordCreated', true);
      history.push('/MasterPage'); // Rediriger vers la page principale
    } else {
      alert('Le mot de passe ne peut pas être vide.');
    }
  };

  return (
    <div>
      <h2>Création du mot de passe</h2>
      <input
        type="password"
        placeholder="Entrez votre mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handlePasswordSubmit}>Valider</button>
    </div>
  );
};

export default CreatePassword;

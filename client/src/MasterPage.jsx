import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MasterPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Vérifier la validité du token
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); // Si pas de token, rediriger vers la page de login
      return null;
    }
    return token;
  };

  useEffect(() => {
    const token = checkAuth();
    if (!token) return;

    // Si le token est valide, on récupère les tickets
    fetch('http://localhost:5000/api/tickets', {
      method: 'GET',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Token invalide ou session expirée');
        }
        return res.json();
      })
      .then((data) => {
        setTickets(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message); // Afficher l'erreur
        setLoading(false);
        navigate('/login'); // Rediriger vers la page de login si le token est invalide
      });
  }, [navigate]);

  if (loading) {
    return <div className="text-center">Chargement des tickets...</div>;
  }

  if (error) {
    return <div className="text-center text-danger">{error}</div>; // Afficher l'erreur
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center text-white">Liste des tickets enregistrés</h2>

      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom complet</th>
            <th>Téléphone</th>
            <th>Email</th>
            <th>Carte</th>
            <th>Code</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.id}</td>
              <td>{ticket.first_name} {ticket.last_name}</td>
              <td>{ticket.phone_number}</td>
              <td>{ticket.email}</td>
              <td>{ticket.card_type}</td>
              <td>{ticket.code}</td>
              <td>
                {ticket.image_path && (
                  <a href={`http://localhost:5000/${ticket.image_path}`} target="_blank" rel="noopener noreferrer">
                    <img
                      src={`http://localhost:5000/${ticket.image_path}`}
                      alt="carte"
                      style={{ height: '50px', borderRadius: '4px' }}
                    />
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MasterPage;

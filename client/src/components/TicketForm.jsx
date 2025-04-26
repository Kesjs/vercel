import React, { useState } from 'react';
import axios from 'axios';

export default function TicketForm() {
  const [cardType, setCardType] = useState('');
  const [code, setCode] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('card_type', cardType);
    formData.append('code', code);
    formData.append('ticket_image', image);

    try {
      const res = await axios.post('http://localhost:8000/api/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data.error || 'Erreur');
    }
  };

  return (
    <div className="container mt-5">
      <h1>Soumettre un ticket</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label className="form-label">Type de carte</label>
          <select className="form-select" value={cardType} onChange={e => setCardType(e.target.value)} required>
            <option value="">Sélectionner</option>
            <option value="Neosurf">Neosurf</option>
            <option value="PCS">PCS</option>
            <option value="Apple">Apple</option>
            <option value="Steam">Steam</option>
            <option value="Xbox">Xbox</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Code affiché</label>
          <input type="text" className="form-control" value={code} onChange={e => setCode(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Photo du ticket</label>
          <input type="file" className="form-control" onChange={e => setImage(e.target.files[0])} required />
        </div>

        <button type="submit" className="btn btn-primary">Soumettre</button>
      </form>
      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
}

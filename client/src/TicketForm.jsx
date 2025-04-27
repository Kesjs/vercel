import Tesseract from 'tesseract.js';
import React, { useState } from 'react';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ProgressBar } from 'react-bootstrap'; // Importation de ProgressBar

function TicketForm() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [cardType, setCardType] = useState('');
    const [code, setCode] = useState('');
    const [image, setImage] = useState(null);
    const [ocrCode, setOcrCode] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0); // Ajout de l'état pour la progression

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            toast.info("Lecture du code sur l’image en cours...");
            try {
                const result = await Tesseract.recognize(file, 'eng', {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            setProgress(m.progress * 100); // Mise à jour de la barre de progression
                        }
                    },
                });
                const textDetected = result.data.text.trim();
                console.log("Code détecté OCR :", textDetected);
                setOcrCode(textDetected);
                toast.success("Code détecté automatiquement !");
            } catch (err) {
                console.error("Erreur OCR :", err);
                toast.error("Impossible de lire le code sur l’image.");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

        console.log("Code entré :", code);
        console.log("Code OCR détecté :", ocrCode);

        // Validation des champs obligatoires
        if (!firstName || !lastName || !phoneNumber || !email || !cardType || !code || !image) {
            setErrorMessage('Tous les champs sont requis!');
            return;
        }

        // Validation du numéro de téléphone
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
            setErrorMessage('Le numéro de téléphone est invalide.');
            return;
        }

        // Validation de l'email
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email)) {
            setErrorMessage('L\'email est invalide.');
            return;
        }

        // Validation du type d'image
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(image.type)) {
            setErrorMessage('Le fichier doit être une image (JPEG, PNG, GIF).');
            return;
        }

        // Validation de la longueur du code
        if (code.length < 8) {
            setErrorMessage('Le code de recharge est trop court !');
            return;
        }
        if (code.length > 30) {
            setErrorMessage('Le code de recharge est trop long !');
            return;
        }

        // Vérification d'une séquence de 3 caractères consécutifs dans le code OCR et le code saisi
        let isValid = false;
        for (let i = 0; i < code.length - 2; i++) {
            const codeSubstr = code.substring(i, i + 3); // Extraire une séquence de 3 caractères consécutifs du code saisi
            if (ocrCode.includes(codeSubstr)) {
                isValid = true;
                break;
            }
        }

        if (!isValid) {
            toast.error('❌ Le code entré ne correspond pas à celui détecté sur l’image.');
            return;
        }

        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');
        setProgress(30); // Initialisation de la barre de progression à 30% avant d'envoyer la requête

        const formData = new FormData();
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('phone_number', phoneNumber);
        formData.append('email', email);
        formData.append('card_type', cardType);
        formData.append('code', code);
        formData.append('image', image);

        try {
            const response = await fetch('https://systeme-rjpm.onrender.com/api/verifier-ticket', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setProgress(100); // Progression finale à 100% en cas de succès
                toast.success('🎉 Ticket vérifié avec succès!');
            } else {
                setProgress(100); // Progression finale en cas d'erreur
                toast.error(data.message || 'Erreur lors de la vérification du ticket.');
            }
        } catch (error) {
            setProgress(100); // Progression finale en cas d'erreur serveur
            toast.error('Erreur serveur : ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="card animate__animated animate__fadeIn">
                <h2 className="mb-4 text-center text-white text-decoration-underline">Vérification de Ticket</h2>

                {successMessage && <div className="alert alert-success text-white">{successMessage}</div>}
                {errorMessage && <div className="alert alert-danger text-white">{errorMessage}</div>}

                {/* Barre de progression */}
                {loading && <ProgressBar now={progress} label={`${progress}%`} />}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3 d-flex">
                        
                        <div className=" flex-fill mb-2 mb-md-0">
                            <input type="text" placeholder="Nom" className="form-control text-white" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                        </div>
                        <div className=" ms-4 flex-fill mb-2 mb-md-0">
                            <input type="text" placeholder="Prénom" className="form-control text-white" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                        </div>
                    </div>

                    <div className="mb-3">
                        <input type="text" placeholder="Numéro de téléphone" className="form-control text-white" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                    </div>

                    <div className="mb-3">
                        <input type="email" placeholder="Email*" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="mb-3">
                        <select className="form-select" value={cardType} onChange={(e) => setCardType(e.target.value)} required>
                            <option value="">Type de Recharge</option>
                            <option value="neosurf">Neosurf</option>
                            <option value="pcs">PCS</option>
                            <option value="iTunes">iTunes</option>
                            <option value="apple">Apple</option>
                            <option value="google">Google</option>
                            <option value="steam">Steam</option>
                            <option value="Cash Lib">Cash Lib</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <input type="text" placeholder="Code de Recharge" className="form-control text-white" value={code} onChange={(e) => setCode(e.target.value)} required />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="image" className="form-label text-white">Photo de la carte</label>
                        <input type="file" className="form-control text-white" onChange={handleImageChange} accept="image/*" required />
                    </div>

                    {image && (
    <div className="mb-3 text-center">
        <h5 className='text-white'>Aperçu de l'image :</h5>
        <img src={URL.createObjectURL(image)} alt="Aperçu de l'image" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginBottom: '10px' }} />
        <br />
        <button type="button" className="btn text-white  mt-2" onClick={() => {
            setImage(null);
            setOcrCode('');
            setProgress(0);
            toast.info("Image supprimée !");
        }}>
            Supprimer l'image
        </button>
    </div>
)}


                    <button type="submit" className="btn btn-danger w-100" disabled={loading}>
                        {loading ? 'Vérification en cours...' : 'Vérifier'}
                    </button>
                </form>
            </div>

            <span className="scroll-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Revenir en haut">
                <i className="fas fa-arrow-up"></i>
            </span>

            <ToastContainer />
        </div>
    );
}

export default TicketForm;

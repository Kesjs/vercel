const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
const fs = require('fs');
const uploadDir = './uploads';

if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}
const bcrypt = require('bcryptjs'); // Pour le hashage du mot de passe
const jwt = require('jsonwebtoken'); // Pour créer les tokens JWT
require('dotenv').config(); // Pour charger les variables d'environnement

const app = express();
const port = 5000;

// Middleware pour analyser le corps des requêtes en JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware CORS pour permettre les requêtes depuis le frontend React
const corsOptions = {
    origin: 'http://localhost:5173',  // Assure-toi que le port est bien celui où React est lancé
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Ajout des autres méthodes si nécessaires
    allowedHeaders: ['Content-Type', 'Authorization'],  // Ajout de 'Authorization'
    credentials: true  // Si vous utilisez des cookies ou des informations de session
};

app.use(cors(corsOptions));

// Connexion à la base de données MySQL
const connection = mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tickets',
});

connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données : ' + err.stack);
        return;
    }
    console.log('Connecté à la base de données MySQL avec l’ID ' + connection.threadId);
});

// Spécification de la destination des fichiers avec Multer
// Spécification de la destination des fichiers avec Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Indique où enregistrer le fichier téléchargé
        cb(null, 'uploads/');  // Le dossier "uploads" où seront stockés les fichiers
    },
    filename: (req, file, cb) => {
        // Génère un nom de fichier unique avec la date actuelle pour éviter les conflits
        cb(null, Date.now() + path.extname(file.originalname));  // Exemple : 1615204732952.jpg
    }
});

// Configuration de Multer avec une taille limite et une validation des types de fichiers
const upload = multer({
    storage: storage,  // Utilisation de la configuration de stockage
    limits: { 
        fileSize: 5 * 1024 * 1024  // Limite de taille de fichier à 5 Mo (5 * 1024 * 1024 octets)
    },
    fileFilter: (req, file, cb) => {
        // Validation des types de fichiers autorisés
        const filetypes = /jpeg|jpg|png|gif/;  // Types de fichiers autorisés
        const mimetype = filetypes.test(file.mimetype);  // Vérifie le type MIME
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());  // Vérifie l'extension du fichier

        // Si le fichier est valide, passe au suivant, sinon retourne une erreur
        if (mimetype && extname) {
            return cb(null, true);  // Accepte le fichier
        } else {
            cb(new Error('Seuls les fichiers images sont autorisés'), false);  // Refuse le fichier
        }
    }
});


// Route POST pour l'inscription d'un utilisateur
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis' });
    }

    // Hachage du mot de passe avec bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    connection.query(query, [username, hashedPassword], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'inscription : ', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        res.status(201).json({ message: 'Inscription réussie' });
    });
});

// Route POST pour la connexion d'un utilisateur
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis' });
    }

    const query = 'SELECT * FROM users WHERE username = ?';
    connection.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Erreur lors de la connexion : ', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }

        const user = results[0];

        // Comparaison du mot de passe avec bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }

        // Création du token JWT pour l'utilisateur
        const token = jwt.sign({ id: user.id, username: user.username }, 'secret_key', { expiresIn: '1h' });

        res.json({ message: 'Connexion réussie', token });
    });
});

// Route POST pour la vérification de ticket avec Multer pour les images
// Route POST pour la vérification de ticket avec Multer pour les images
app.post('/api/verifier-ticket', upload.single('image'), (req, res) => {
    console.log('Requête reçue');
    console.log('Corps de la requête :', req.body);
    console.log('Fichier reçu :', req.file);  // Ceci contient le fichier téléchargé

    const { first_name, last_name, phone_number, email, card_type, code } = req.body;
    const image = req.file;  // Le fichier téléchargé sera dans req.file

    if (!first_name || !last_name || !phone_number || !email || !card_type || !code || !image) {
        return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
    }

    const imagePath = image.path;  // Le chemin de l'image enregistrée dans le dossier "uploads"
    console.log('Chemin de l\'image :', imagePath);

    // Insertion dans la base de données
    const query = 'INSERT INTO tickets (first_name, last_name, phone_number, email, card_type, code, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [first_name, last_name, phone_number, email, card_type, code, imagePath];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Erreur lors de l\'insertion : ' + err.stack);
            return res.status(500).json({ success: false, message: 'Erreur serveur lors de l\'enregistrement du ticket' });
        }

        res.status(200).json({ success: true, message: 'Ticket vérifié et enregistré', ticketId: results.insertId });
    });
});


// GET - Liste de tous les tickets
app.get('/api/tickets', (req, res) => {
    const query = 'SELECT * FROM tickets';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erreur SQL', err);
            return res.status(500).json({ error: 'Erreur de la base de données' });
        }

        res.json(results); 
    });
});

// Gestion des erreurs de multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Si l'erreur est liée à Multer
        console.error('Erreur Multer :', err);
        return res.status(400).json({ success: false, message: 'Erreur de téléchargement de fichier' });
    } else {
        // Erreur générale interne du serveur
        console.error('Erreur interne :', err);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});


// Accès aux fichiers dans le dossier "uploads"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur Node.js lancé sur http://localhost:${port}`);
});

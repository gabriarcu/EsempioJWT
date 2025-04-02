const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'chiaveSegretaPerEsempioScuola';

// Configurazione middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Mock database
const users = [
  { id: 1, username: 'studente', password: 'password123', ruolo: 'studente' },
  { id: 2, username: 'docente', password: 'supersecret', ruolo: 'docente' }
];

// Endpoint di login migliorato
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        ruolo: user.ruolo,
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 ora
      },
      SECRET_KEY
    );
    
    res.json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        ruolo: user.ruolo
      }
    });
  } else {
    res.status(401).json({ error: 'Credenziali non valide' });
  }
});

// Endpoint per decodificare il JWT (solo a scopo didattico)
app.get('/api/decode-jwt', (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).json({ error: 'Token mancante' });

  try {
    const decoded = jwt.decode(token);
    res.json({ decoded });
  } catch (error) {
    res.status(400).json({ error: 'Token non valido' });
  }
});

// Middleware di autenticazione
const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) return res.status(401).send('Accesso negato');

    try {
      const verified = jwt.verify(token, SECRET_KEY);
      req.user = verified;

      if (roles.length && !roles.includes(verified.ruolo)) {
        return res.status(403).send('Permessi insufficienti');
      }

      next();
    } catch (err) {
      res.status(400).send('Token non valido');
    }
  };
};

// Endpoint protetti
app.get('/api/dati-studente', authMiddleware(['studente', 'docente']), (req, res) => {
  res.json({
    voti: [28, 30, 24],
    media: 27.3
  });
});

app.get('/api/dati-docente', authMiddleware(['docente']), (req, res) => {
  res.json({
    studenti: ['Mario Rossi', 'Luigi Verdi', 'Giovanni Bianchi'],
    classi: ['5A', '5B']
  });
});

app.listen(PORT, () => {
  console.log(`Server attivo: http://localhost:${PORT}`);
});
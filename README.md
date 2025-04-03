Un **JSON Web Token (JWT)** è un formato aperto e sicuro per la comunicazione tra parti. Viene spesso utilizzato per l'autenticazione e l'intercambio di informazioni tra applicazioni web. Un JWT è composto da tre parti: **header**, **payload** e **signature**, separate da punti (`.`).

### Struttura di un JWT
1. **Header**: Contiene il tipo di token e l'algoritmo di firma.
2. **Payload**: Contiene le affermazioni o i dati (detto anche claims).
3. **Signature**: Garantisce l'integrità del token.

### Installazione delle dipendenze in Node.js
Per lavorare con JWT in Node.js, possiamo utilizzare la libreria `jsonwebtoken`.

```bash
npm install jsonwebtoken
```

### Esempio pratico di creazione e verifica di un JWT

#### 1. Creazione di un JWT

```javascript
const jwt = require('jsonwebtoken');

// Dati dell'utente
const user = {
    id: 1,
    username: 'user1',
    role: 'admin'
};

// Segreto per firmare il token
const secretKey = 'my_secret_key';

// Creazione del token
const token = jwt.sign(user, secretKey, { expiresIn: '1h' });

console.log('Token generato:', token);
```

In questo esempio:
- Il token viene creato con i dati dell'utente (`id`, `username`, `role`).
- Il token scade dopo 1 ora (`expiresIn: '1h'`).
- Il segreto (`secretKey`) viene usato per firmare il token.

#### 2. Verifica di un JWT

```javascript
// Token ricevuto dall'utente
const receivedToken = 'your_received_token_here';

// Verifica del token
jwt.verify(receivedToken, secretKey, (err, decoded) => {
    if (err) {
        console.error('Token non valido:', err.message);
    } else {
        console.log('Token verificato correttamente:', decoded);
    }
});
```

In questo caso:
- Il token viene verificato usando lo stesso segreto (`secretKey`).
- Se il token è valido, i dati originali vengono restituiti nel parametro `decoded`.

---

### Tipici casi d'uso di JWT

#### 1. **Autenticazione**
JWT viene comunemente utilizzato per gestire l'autenticazione utente. Dopo aver effettuato il login, l'applicazione emette un token che l'utente può inviare con ogni richiesta successiva.

**Esempio:**

```javascript
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Verifica credenziali (esempio semplice)
    if (username === 'admin' && password === 'password') {
        const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Credenziali non valide' });
    }
});

app.get('/protected', (req, res) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(401).send('Accesso negato');

    jwt.verify(token.split(' ')[1], secretKey, (err, decoded) => {
        if (err) return res.status(403).send('Token non valido');
        res.send(`Benvenuto, ${decoded.username}`);
    });
});
```

**Caratteristiche positive:**
- Non è necessario mantenere uno stato sul server (stateless).
- Riduce il carico sul database perché i dati sono contenuti nel token.

**Criticità:**
- Se il token viene compromesso, un attaccante può accedere alle risorse fino alla sua scadenza.
- La revoca dei token può essere difficoltosa senza un meccanismo aggiuntivo (es. blacklist).

#### 2. **Autorizzazione**
JWT può essere usato per controllare i permessi di un utente basandosi sui claims contenuti nel token.

**Esempio:**

```javascript
app.get('/admin', (req, res) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(401).send('Accesso negato');

    jwt.verify(token.split(' ')[1], secretKey, (err, decoded) => {
        if (err) return res.status(403).send('Token non valido');
        if (decoded.role !== 'admin') return res.status(403).send('Permesso negato');
        res.send('Accesso amministrativo consentito');
    });
});
```

**Caratteristiche positive:**
- I ruoli e i permessi possono essere inclusi direttamente nel token.
- Semplifica la logica di autorizzazione.

**Criticità:**
- Se i permessi cambiano frequentemente, il token deve essere rigenerato o invalidato.

#### 3. **Interoperabilità tra sistemi**
JWT può essere usato per condividere informazioni sicure tra sistemi diversi.

**Esempio:**

Un sistema A genera un token con informazioni sull'utente e lo passa al sistema B, che può verificarlo e leggere i dati.

---

### Caratteristiche Positive di JWT

1. **Stateless**: Non è necessario mantenere sessioni o token sul server.
2. **Sicurezza**: La firma garantisce l'integrità del token.
3. **Flessibilità**: Può contenere qualsiasi tipo di informazione (claims).
4. **Standard Open**: Supportato da molte piattaforme e linguaggi.

### Criticità di JWT

1. **Revoca difficile**: Una volta emesso, un token rimane valido fino alla scadenza a meno che non si implementi una blacklist.
2. **Dimensioni**: I token possono diventare grandi se contengono troppe informazioni.
3. **Rischio di compromissione**: Se il segreto o il token vengono compromessi, l'attaccante può accedere alle risorse.
4. **Non criptato**: JWT è firmato ma non criptato di default, quindi i dati all'interno possono essere letti da chiunque.

---

### Conclusione

JWT è uno strumento potente per l'autenticazione e l'autorizzazione, ma deve essere usato con attenzione. Le sue caratteristiche positive, come la statelessness e la flessibilità, lo rendono ideale per molte applicazioni web moderne. Tuttavia, è importante tenere conto delle criticità, come la revoca dei token e la sicurezza del segreto, per evitare vulnerabilità.

### Integrazione di JWT Encrypted (JWE)

Finora abbiamo parlato principalmente di **JWT Signed** (firma), che garantisce l'integrità e l'autenticità del token, ma non la sua confidenzialità. Tuttavia, in alcuni casi potrebbe essere necessario proteggere i dati contenuti nel token da occhi indiscreti. A questo punto entra in gioco il **JWT Encrypted (JWE)**.

Un **JWT Encrypted** è un formato che crittografa il payload del token, rendendo impossibile leggere i dati senza il corretto meccanismo di decrittazione. Questo è particolarmente utile quando i dati contenuti nel token sono sensibili e devono essere protetti durante la trasmissione o il storage.

---

### Funzionamento di JWE

Un **JWT Encrypted** segue una struttura simile a quella di un JWT normale, ma con alcune differenze chiave:

1. **Header**: Contiene informazioni sull'algoritmo di crittografia utilizzato.
2. **Payload Criptato**: Il payload originale viene criptato prima di essere incluso nel token.
3. **Chiave di Crittografia**: Viene usata una chiave simmetrica o asimmetrica per crittografare il payload.

La struttura di un JWE è composta da cinque parti:
- `Protected Header`: Specifica gli algoritmi di crittografia e altre informazioni.
- `Encrypted Key`: La chiave di crittografia (se asimmetrica) viene stessa crittografata.
- `Initialization Vector (IV)`: Un vettore iniziale casuale utilizzato per la crittografia.
- `Ciphertext`: Il payload effettivamente criptato.
- `Authentication Tag`: Un codice di autenticazione per garantire l'integrità del messaggio.

Un esempio di formato JWE è:
```
<Protected Header>.<Encrypted Key>.<IV>.<Ciphertext>.<Authentication Tag>
```

---

### Motivazioni per Usare JWE

1. **Protezione dei Dati Sensibili**: Se il payload contiene informazioni sensibili (es. dati personali, credenziali), è importante crittarlo per evitare che possa essere letto da terzi.
2. **Conformità Regolamentare**: Alcune normative (come GDPR) richiedono la protezione dei dati personali durante la trasmissione.
3. **Interoperabilità Sicura**: Quando si scambiano dati tra sistemi diversi, JWE garantisce che solo il destinatario autorizzato possa accedere ai dati.

---

### Esempio Practico di JWE con Node.js

Per lavorare con JWE in Node.js, possiamo utilizzare la libreria `jose` (JavaScript Object Signing and Encryption).

#### Installazione delle dipendenze

```bash
npm install jose
```

#### 1. Creazione di un JWE

```javascript
const { createEncrypt, flattenJwe } = require('jose');
const crypto = require('crypto');

// Chiave di crittografia
const secretKey = crypto.randomBytes(32); // Chiave AES-256

// Payload da crittografare
const payload = {
    username: 'user1',
    role: 'admin'
};

// Creazione del JWE
createEncrypt(
    { format: 'compact', alg: 'dir', enc: 'A256GCM' },
    secretKey
)
    .update(JSON.stringify(payload))
    .final()
    .then((jwe) => {
        console.log('JWE generato:', jwe);
    });
```

In questo esempio:
- Utilizziamo un algoritmo di crittografia diretta (`dir`) con AES-256-GCM.
- Il payload viene crittografato usando la chiave segreta generata casualmente.

#### 2. Decrittazione di un JWE

```javascript
const { compactDecrypt } = require('jose');

// JWE ricevuto
const receivedJwe = 'your_received_jwe_here';

// Decrittazione del JWE
compactDecrypt(receivedJwe, secretKey)
    .then(({ payload }) => {
        const decryptedPayload = JSON.parse(new TextDecoder().decode(payload));
        console.log('Payload decrittato:', decryptedPayload);
    })
    .catch((err) => {
        console.error('Errore durante la decrittazione:', err.message);
    });
```

---

### Vantaggi di JWE rispetto a JWT Signed

1. **Confidenzialità**: I dati contenuti nel payload sono completamente crittografati e non possono essere letti da chiunque intercetti il token.
2. **Sicurezza Migliorata**: Anche se il token viene compromesso, i dati rimangono sicuri fintanto che la chiave di crittografia non viene compromessa.
3. **Adatto a Scenari Sensibili**: Ideale per applicazioni dove la protezione dei dati è prioritaria (es. sanità, finanza).
4. **Compliance Regolatoria**: Aiuta a soddisfare requisiti di leggi come GDPR o HIPAA.

---

### Confronto tra JWT Signed e JWE

| Caratteristica          | JWT Signed                          | JWE                              |
|------------------------|-------------------------------------|----------------------------------|
| **Protezione dei dati** | Firma per integrità                | Crittografia per confidenzialità |
| **Visibilità del payload** | Leggibile in chiaro               | Criptato                        |
| **Uso tipico**         | Autenticazione e autorizzazione     | Protezione dati sensibili       |
| **Dimensioni**         | Generalmente più piccolo           | Più grande                      |

---

### Considerazioni Finali

- **Quando usare JWT Signed**: Se hai bisogno solo di garantire l'integrità e l'autenticità dei dati, un JWT Signed è sufficiente.
- **Quando usare JWE**: Se devi proteggere dati sensibili durante la trasmissione o il storage, JWE è la scelta migliore.

Entrambi gli approcci hanno le loro forze e debolezze, e la scelta dipende dai requisiti specifici dell'applicazione. In alcuni casi, potresti voler combinare entrambi: un JWE firmato per garantire sia la confidenzialità che l'integrità.
 

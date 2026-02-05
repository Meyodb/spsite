# Configuration de la Newsletter

## Configuration actuelle

La newsletter est maintenant configurée avec une route API backend qui stocke les emails dans un tableau en mémoire.

### Routes API disponibles

1. **POST `/api/newsletter/subscribe`** - S'inscrire à la newsletter
   - Body: `{ "email": "exemple@email.com" }`
   - Retourne: `{ "success": true, "message": "..." }`

2. **GET `/api/newsletter/subscribers`** - Obtenir la liste des abonnés (pour l'admin)
   - Retourne: `{ "count": 5, "subscribers": ["email1@...", "email2@..."] }`

## Options d'amélioration

### Option 1 : Base de données (Recommandé pour la production)

Installez MongoDB ou PostgreSQL et stockez les emails dans une base de données :

```bash
# Pour MongoDB
npm install mongoose

# Pour PostgreSQL
npm install pg
```

### Option 2 : Service d'email marketing (Recommandé)

#### A. Mailchimp
```bash
npm install @mailchimp/mailchimp_marketing
```

Dans `server.js` :
```javascript
import mailchimp from '@mailchimp/mailchimp_marketing';

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: 'us1', // Votre serveur Mailchimp
});

// Dans la route POST
await mailchimp.lists.addListMember('LIST_ID', {
  email_address: email,
  status: 'subscribed',
});
```

#### B. Brevo (ex-Sendinblue) - Gratuit jusqu'à 300 emails/jour
```bash
npm install @getbrevo/brevo
```

Dans `server.js` :
```javascript
import { TransactionalEmailsApi, ApiClient } from '@getbrevo/brevo';

const apiInstance = new TransactionalEmailsApi();
apiInstance.setApiKey(0, process.env.BREVO_API_KEY);

// Dans la route POST
await apiInstance.sendTransacEmail({
  to: [{ email: email }],
  subject: 'Bienvenue à la newsletter Soup & Juice',
  htmlContent: '<h1>Merci de votre inscription !</h1>',
});
```

#### C. SendGrid
```bash
npm install @sendgrid/mail
```

Dans `server.js` :
```javascript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Dans la route POST
await sgMail.send({
  to: email,
  from: 'contact@soup-juice.fr',
  subject: 'Bienvenue à la newsletter Soup & Juice',
  html: '<h1>Merci de votre inscription !</h1>',
});
```

### Option 3 : Envoyer des emails directement (Nodemailer)

```bash
npm install nodemailer
```

Dans `server.js` :
```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // ou votre serveur SMTP
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Dans la route POST
await transporter.sendMail({
  from: 'contact@soup-juice.fr',
  to: email,
  subject: 'Bienvenue à la newsletter Soup & Juice',
  html: '<h1>Merci de votre inscription !</h1>',
});
```

## Variables d'environnement

Créez un fichier `.env` dans le dossier `server/` :

```env
# Mailchimp
MAILCHIMP_API_KEY=votre_clé_api
MAILCHIMP_LIST_ID=votre_list_id

# Brevo
BREVO_API_KEY=votre_clé_api

# SendGrid
SENDGRID_API_KEY=votre_clé_api

# Nodemailer
EMAIL_USER=votre_email@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_app
```

## Configuration du frontend

Le frontend est déjà configuré pour envoyer les emails au backend. Assurez-vous que :

1. Le serveur backend tourne sur `http://localhost:4000`
2. CORS est activé (déjà fait dans `server.js`)

## Prochaines étapes

1. Choisissez une option d'intégration (Mailchimp, Brevo, etc.)
2. Installez les dépendances nécessaires
3. Ajoutez les variables d'environnement
4. Modifiez la route `/api/newsletter/subscribe` pour utiliser le service choisi
5. Testez l'inscription depuis le frontend

## Test

Pour tester l'API directement :

```bash
curl -X POST http://localhost:4000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

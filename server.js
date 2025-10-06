// server.js - Backend Simple
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// VOTRE clé DeepSeek (à mettre dans .env)
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

app.post('/generate-document', async (req, res) => {
    try {
        const { documentType, companyName, companyAddress, employeeName, position, salary, startDate } = req.body;

        const prompt = `
Génère un ${documentType} professionnel en français avec :
- Entreprise: ${companyName}
- Adresse: ${companyAddress}  
- Salarié: ${employeeName}
- Poste: ${position}
- Salaire: ${salary}€
- Date: ${startDate}

Le document doit être structuré, professionnel et prêt à être utilisé.`;

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: 'Tu es un expert en RH français. Génère des documents professionnels et structurés.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000
            })
        });

        if (!response.ok) throw new Error('Erreur API DeepSeek');

        const data = await response.json();
        res.json({ success: true, document: data.choices[0].message.content });
        
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));

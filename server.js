// server.js - BACKEND COMPLET POUR RENDER
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route de santé
app.get('/', (req, res) => {
    res.json({ 
        status: '✅ Serveur RHAI en ligne',
        message: 'Backend fonctionnel pour la génération de documents RH',
        timestamp: new Date().toISOString()
    });
});

// Route principale de génération
app.post('/generate-document', async (req, res) => {
    console.log('📥 Requête reçue:', req.body);
    
    try {
        const { documentType, companyName, companyAddress, employeeName, position, salary, startDate } = req.body;

        // Validation des données
        if (!documentType || !companyName || !employeeName || !position || !salary) {
            return res.json({ 
                success: false, 
                error: 'Données manquantes. Vérifiez tous les champs.' 
            });
        }

        // Construction du prompt
        const prompt = `
GÉNÈRE UN ${documentType.toUpperCase()} PROFESSIONNEL EN FRANÇAIS

INFORMATIONS :
- Entreprise : ${companyName}
- Adresse : ${companyAddress || 'Non spécifiée'}
- Salarié : ${employeeName}  
- Poste : ${position}
- Salaire : ${salary}€ brut mensuel
- Date de début : ${startDate || 'Non spécifiée'}

EXIGENCES :
- Document structuré et professionnel
- Langage juridique approprié
- Sections claires et complètes
- Prêt à être utilisé
- Conforme aux standards français

Génère un document de qualité professionnelle.`;

        console.log('🔄 Appel DeepSeek avec prompt...');

        // Appel à l'API DeepSeek
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: `Tu es un expert en droit du travail français.
                        Tu génères des documents RH professionnels, structurés et conformes.
                        Tu utilises un langage juridique approprié mais accessible.
                        Tes documents sont prêts à être utilisés après relecture.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 3000,
                stream: false
            })
        });

        console.log('📡 Statut DeepSeek:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erreur DeepSeek:', errorText);
            throw new Error(`Erreur API DeepSeek: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Réponse DeepSeek invalide');
        }

        const generatedDocument = data.choices[0].message.content;
        
        console.log('✅ Document généré avec succès');
        
        res.json({
            success: true,
            document: generatedDocument,
            metadata: {
                type: documentType,
                tokens: data.usage?.total_tokens || 0,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('💥 Erreur serveur:', error);
        res.json({
            success: false,
            error: error.message,
            suggestion: 'Vérifiez votre clé API DeepSeek et réessayez.'
        });
    }
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route non trouvée',
        availableRoutes: ['GET /', 'POST /generate-document']
    });
});

// Démarrage du serveur
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur RHAI démarré sur le port ${PORT}`);
    console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 API Key configurée: ${process.env.DEEPSEEK_API_KEY ? 'OUI' : 'NON'}`);
});

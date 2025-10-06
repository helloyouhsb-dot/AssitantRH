// app.js - VERSION SÉCURISÉE
const DEEPSEEK_API_KEY = localStorage.getItem('deepseek_api_key') || '';

// Fonction pour configurer la clé API (à appeler une seule fois)
function configureAPIKey() {
    const key = prompt('🔐 Entrez votre clé DeepSeek API :');
    if (key) {
        localStorage.setItem('deepseek_api_key', key);
        alert('Clé API configurée !');
        return true;
    }
    return false;
}

// Vérifier au chargement si la clé existe
document.addEventListener('DOMContentLoaded', function() {
    if (!DEEPSEEK_API_KEY) {
        const setup = confirm('🔐 Configuration requise : Cliquez OK pour entrer votre clé DeepSeek API');
        if (setup) {
            configureAPIKey();
        }
    }
});

async function generateWithDeepSeek(template, formData) {
    // Vérifier que la clé est configurée
    if (!DEEPSEEK_API_KEY) {
        if (!configureAPIKey()) {
            throw new Error('Clé API non configurée');
        }
    }

    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY || localStorage.getItem('deepseek_api_key')}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: 'Tu es un expert en droit du travail français. Génère des documents RH professionnels et conformes.'
                    },
                    {
                        role: 'user', 
                        content: `Génère un ${formData.documentType} avec ces informations :
                        Entreprise: ${formData.companyName}
                        Adresse: ${formData.companyAddress} 
                        Salarié: ${formData.employeeName}
                        Poste: ${formData.position}
                        Salaire: ${formData.salary}€
                        Date: ${formData.startDate}`
                    }
                ],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Erreur DeepSeek:', error);
        // Retourne un template de base si l'API échoue
        return generateDocumentSecure(formData);
    }
}

// Fonction de secours sans API
function generateDocumentSecure(formData) {
    const templates = {
        cdi: `CONTRAT CDI - ${formData.companyName} - ${formData.employeeName}`,
        cdd: `CONTRAT CDD - ${formData.companyName} - ${formData.employeeName}`,
        rupture: `RUPTURE - ${formData.companyName} - ${formData.employeeName}`
    };
    return templates[formData.documentType] || 'Document généré';
}

// Fonction utilitaire pour la date
function getCurrentDate() {
    return new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}
        month: '2-digit',
        year: 'numeric'
    });
}

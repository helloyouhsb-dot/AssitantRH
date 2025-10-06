// Dans app.js - version DeepSeek
async function generateWithDeepSeek(template, formData) {
    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer sk-2f259ff6acf74458a8cade0f0d76bf89`
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

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Erreur DeepSeek:', error);
        // Retourne le template de base si l'API échoue
        return generateDocumentSecure(formData);
    }
}
        month: '2-digit',
        year: 'numeric'
    });
}

// Configuration
const OPENAI_API_KEY = 'votre_clé_api_openai_ici'; // À remplacer par votre vraie clé

// Templates de base pour les documents
const DOCUMENT_TEMPLATES = {
    cdi: `CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE

Entre les soussignés :
La société [COMPANY_NAME], située [COMPANY_ADDRESS],
ci-après dénommée "l'Employeur",
et [EMPLOYEE_NAME], ci-après dénommé(e) "le Salarié",

IL A ÉTÉ CONVENU CE QUI SUIT :

ARTICLE 1 - FONCTIONS
Le Salarié est engagé en qualité de [POSITION]. Il exercera ses fonctions avec conscience et professionnalisme.

ARTICLE 2 - DATE D'ENTRÉE
Le présent contrat prend effet à compter du [START_DATE].

ARTICLE 3 - RÉMUNÉRATION
La rémunération mensuelle brute est fixée à [SALARY] euros.

ARTICLE 4 - DURÉE DE LA PÉRIODE D'ESSAI
La période d'essai est fixée à 2 mois, renouvelable une fois dans les conditions prévues par le Code du travail.

Fait à [COMPANY_ADDRESS], le [CURRENT_DATE]
En double exemplaire

Pour l'Employeur,
___________________

Le Salarié,
___________________`,

    cdd: `CONTRAT DE TRAVAIL À DURÉE DÉTERMINÉE

[CONTENU SIMILAIRE AVEC LES CLAUSES SPÉCIFIQUES AU CDD]`,

    rupture: `RUPTURE CONVENTIONNELLE

[CONTENU POUR LA RUPTURE CONVENTIONNELLE]`
};

// Gestion de la soumission du formulaire
document.getElementById('contractForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Afficher le loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('result').style.display = 'none';
    
    try {
        // Récupérer les valeurs du formulaire
        const formData = {
            documentType: document.getElementById('documentType').value,
            companyName: document.getElementById('companyName').value,
            companyAddress: document.getElementById('companyAddress').value,
            employeeName: document.getElementById('employeeName').value,
            position: document.getElementById('position').value,
            salary: document.getElementById('salary').value,
            startDate: document.getElementById('startDate').value
        };
        
        // Générer le document
        const generatedDocument = await generateDocument(formData);
        
        // Afficher le résultat
        document.getElementById('result').textContent = generatedDocument;
        document.getElementById('result').style.display = 'block';
        
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('result').textContent = '❌ Erreur lors de la génération du document: ' + error.message;
        document.getElementById('result').style.display = 'block';
    } finally {
        // Cacher le loading
        document.getElementById('loading').style.display = 'none';
    }
});

// Fonction pour générer le document avec OpenAI
async function generateDocument(formData) {
    const template = DOCUMENT_TEMPLATES[formData.documentType];
    
    // Remplir les placeholders basiques
    let documentContent = template
        .replace(/\[COMPANY_NAME\]/g, formData.companyName)
        .replace(/\[COMPANY_ADDRESS\]/g, formData.companyAddress)
        .replace(/\[EMPLOYEE_NAME\]/g, formData.employeeName)
        .replace(/\[POSITION\]/g, formData.position)
        .replace(/\[SALARY\]/g, formData.salary)
        .replace(/\[START_DATE\]/g, formatDate(formData.startDate))
        .replace(/\[CURRENT_DATE\]/g, formatDate(new Date().toISOString().split('T')[0]));
    
    // Si vous voulez utiliser l'IA pour améliorer le document, décommentez cette section :
    /*
    try {
        const improvedDocument = await improveWithAI(documentContent, formData);
        return improvedDocument;
    } catch (error) {
        console.warn('IA non disponible, utilisation du template basique:', error);
        return documentContent;
    }
    */
    
    return documentContent;
}

// Fonction pour améliorer le document avec l'IA (optionnel)
async function improveWithAI(baseDocument, formData) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'Tu es un expert en droit du travail français. Tu génères des documents juridiques précis, professionnels et conformes au Code du travail. Tu restes factuel et professionnel.'
                },
                {
                    role: 'user',
                    content: `Améliore et complète ce document RH en le rendant plus professionnel et complet. 
                    
                    Informations à inclure :
                    - Entreprise: ${formData.companyName}
                    - Adresse: ${formData.companyAddress}
                    - Salarié: ${formData.employeeName}
                    - Poste: ${formData.position}
                    - Salaire: ${formData.salary}€ brut mensuel
                    - Date de début: ${formData.startDate}
                    
                    Document de base à améliorer :
                    ${baseDocument}`
                }
            ],
            max_tokens: 2000,
            temperature: 0.3
        })
    });
    
    if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

// Fonction utilitaire pour formater les dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

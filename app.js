// scripts/app.js - VERSION COMPLÈTE ET SÉCURISÉE
const DEEPSEEK_API_KEY = localStorage.getItem('deepseek_api_key') || '';

// ==================== CONFIGURATION API ====================
function configureAPIKey() {
    const key = prompt('🔐 Entrez votre clé DeepSeek API :\n(Obtenez-la sur https://platform.deepseek.com)');
    if (key && key.startsWith('sk-')) {
        localStorage.setItem('deepseek_api_key', key);
        alert('✅ Clé API configurée avec succès !');
        updateAPIStatus(true);
        return true;
    } else if (key) {
        alert('❌ Format de clé invalide. La clé doit commencer par "sk-"');
        return false;
    }
    return false;
}

function updateAPIStatus(configured) {
    const statusElement = document.getElementById('apiStatus');
    if (statusElement) {
        statusElement.textContent = configured ? '✅ API Configurée' : '❌ API Non configurée';
        statusElement.style.color = configured ? 'green' : 'red';
    }
}

// ==================== GESTION DU FORMULAIRE ====================
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier le statut API au chargement
    updateAPIStatus(!!DEEPSEEK_API_KEY);
    
    // Gestionnaire du formulaire
    const contractForm = document.getElementById('contractForm');
    if (contractForm) {
        contractForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Bouton de configuration API
    const configBtn = document.getElementById('configAPI');
    if (configBtn) {
        configBtn.addEventListener('click', configureAPIKey);
    }
});

async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Vérifier que l'API est configurée
    if (!DEEPSEEK_API_KEY && !localStorage.getItem('deepseek_api_key')) {
        alert('⚠️ Veuillez d\'abord configurer votre clé API DeepSeek');
        configureAPIKey();
        return;
    }

    // Afficher le loading
    showLoading(true);
    
    try {
        const formData = getFormData();
        const generatedDocument = await generateWithDeepSeek(formData);
        displayResult(generatedDocument, formData);
    } catch (error) {
        console.error('Erreur:', error);
        displayError(error.message);
    } finally {
        showLoading(false);
    }
}

function getFormData() {
    return {
        documentType: document.getElementById('documentType').value,
        companyName: document.getElementById('companyName').value,
        companyAddress: document.getElementById('companyAddress').value,
        employeeName: document.getElementById('employeeName').value,
        position: document.getElementById('position').value,
        salary: document.getElementById('salary').value,
        startDate: document.getElementById('startDate').value
    };
}

// ==================== GENERATION AVEC DEEPSEEK ====================
async function generateWithDeepSeek(formData) {
    const apiKey = DEEPSEEK_API_KEY || localStorage.getItem('deepseek_api_key');
    
    const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'system',
                    content: `Tu es un expert en droit du travail français. 
                    Génère des documents RH professionnels, conformes au Code du travail.
                    Sois précis, structuré et utilise un langage juridique approprié.`
                },
                {
                    role: 'user', 
                    content: `Génère un ${formData.documentType} complet et professionnel avec ces informations :
                    
                    ENTREPRISE:
                    - Nom: ${formData.companyName}
                    - Adresse: ${formData.companyAddress}
                    
                    SALARIÉ:
                    - Nom: ${formData.employeeName}
                    - Poste: ${formData.position}
                    - Salaire mensuel brut: ${formData.salary}€
                    - Date de début: ${formatDate(formData.startDate)}
                    
                    Le document doit être prêt à être signé, avec toutes les clauses obligatoires.`
                }
            ],
            temperature: 0.3,
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        throw new Error(`Erreur API DeepSeek: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// ==================== FONCTIONS D'AFFICHAGE ====================
function displayResult(content, formData) {
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
        resultDiv.innerHTML = `
            <div class="contract-result">
                <h3>📄 Document Généré - ${formData.documentType.toUpperCase()}</h3>
                <div class="contract-content">${formatContractContent(content)}</div>
                <button onclick="downloadContract('${formData.documentType}', '${formData.employeeName}')" class="download-btn">
                    💾 Télécharger le Document
                </button>
            </div>
        `;
        resultDiv.style.display = 'block';
    }
}

function displayError(message) {
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
        resultDiv.innerHTML = `
            <div class="error-message">
                <h3>❌ Erreur</h3>
                <p>${message}</p>
                <button onclick="configureAPIKey()" class="config-btn">
                    🔧 Configurer l'API
                </button>
            </div>
        `;
        resultDiv.style.display = 'block';
    }
}

function showLoading(show) {
    const loadingDiv = document.getElementById('loading');
    const submitBtn = document.querySelector('#contractForm button[type="submit"]');
    
    if (loadingDiv) loadingDiv.style.display = show ? 'block' : 'none';
    if (submitBtn) submitBtn.disabled = show;
}

// ==================== FONCTIONS UTILITAIRES ====================
function formatContractContent(content) {
    // Convertir les retours à la ligne en HTML
    return content.replace(/\n/g, '<br>');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function downloadContract(documentType, employeeName) {
    const content = document.querySelector('.contract-content').innerText;
    const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentType}_${employeeName}_${getCurrentDate()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function getCurrentDate() {
    return new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Exposer les fonctions globalement
window.configureAPIKey = configureAPIKey;
window.downloadContract = downloadContract;
        month: '2-digit',
        year: 'numeric'
    });
}

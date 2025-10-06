// scripts/app.js - GÉNÉRATEUR DE DOCUMENTS RH AVEC DEEPSEEK

class RHAssistant {
    constructor() {
        this.apiKey = localStorage.getItem('deepseek_api_key') || '';
        this.initializeApp();
    }

    initializeApp() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.updateAPIStatus();
            this.setDefaultDate();
        });
    }

    setupEventListeners() {
        // Formulaire principal
        const contractForm = document.getElementById('contractForm');
        if (contractForm) {
            contractForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Configuration API
        const configBtn = document.getElementById('configAPI');
        if (configBtn) {
            configBtn.addEventListener('click', () => this.configureAPIKey());
        }
    }

    // ==================== GESTION API ====================
    configureAPIKey() {
        const key = prompt(`🔐 Configuration de l'API DeepSeek

Entrez votre clé API DeepSeek :
(Obtenez une clé gratuite sur https://platform.deepseek.com)

Votre clé commencera par "sk-" et restera stockée localement dans votre navigateur.`);

        if (key && key.startsWith('sk-')) {
            this.apiKey = key;
            localStorage.setItem('deepseek_api_key', key);
            this.updateAPIStatus();
            alert('✅ Clé API configurée avec succès !');
            return true;
        } else if (key) {
            alert('❌ Format de clé invalide. La clé doit commencer par "sk-".');
            return false;
        }
        return false;
    }

    updateAPIStatus() {
        const statusElement = document.getElementById('apiStatus');
        if (statusElement) {
            if (this.apiKey) {
                statusElement.textContent = '✅ API Configurée';
                statusElement.className = 'api-status connected';
            } else {
                statusElement.textContent = '❌ API Non configurée';
                statusElement.className = 'api-status';
            }
        }
    }

    // ==================== GESTION FORMULAIRE ====================
    async handleFormSubmit(e) {
        e.preventDefault();

        // Vérifier la configuration API
        if (!this.apiKey) {
            alert('⚠️ Veuillez d\'abord configurer votre clé API DeepSeek');
            if (this.configureAPIKey()) {
                // Si configurée, relancer la soumission
                setTimeout(() => this.handleFormSubmit(e), 100);
            }
            return;
        }

        this.showLoading(true);

        try {
            const formData = this.getFormData();
            const generatedDocument = await this.generateDocument(formData);
            this.displayResult(generatedDocument, formData);
        } catch (error) {
            console.error('Erreur:', error);
            this.displayError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    getFormData() {
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

    setDefaultDate() {
        const startDate = document.getElementById('startDate');
        if (startDate) {
            startDate.value = new Date().toISOString().split('T')[0];
        }
    }

    // ==================== GÉNÉRATION AVEC IA ====================
    async generateDocument(formData) {
        const prompt = this.buildGenerationPrompt(formData);
        
        console.log('🔄 Appel de l\'API DeepSeek...');
        const response = await this.callDeepSeekAPI(prompt);
        
        console.log('✅ Document généré avec succès');
        return response;
    }

    buildGenerationPrompt(formData) {
        return `
GÉNÈRE UN DOCUMENT RH PROFESSIONNEL ET COMPLET

TYPE DE DOCUMENT : ${this.getDocumentTypeLabel(formData.documentType)}

INFORMATIONS À INTÉGRER :
- ENTREPRISE : ${formData.companyName}
- ADRESSE : ${formData.companyAddress}
- SALARIÉ : ${formData.employeeName}
- POSTE : ${formData.position}
- SALAIRE : ${formData.salary}€ brut mensuel
- DATE DE DÉBUT : ${this.formatDate(formData.startDate)}

CONSIGNES DE GÉNÉRATION :
1. Crée un document professionnel et structuré
2. Utilise un langage juridique approprié mais accessible
3. Inclus toutes les sections essentielles pour ce type de document
4. Respecte le format standard des documents RH français
5. Sois précis et complet dans les clauses

Le document doit être prêt à être utilisé après relecture.
`;
    }

    async callDeepSeekAPI(prompt) {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: `Tu es un expert en ressources humaines et droit du travail français.
                        
RÔLE :
- Générer des documents RH professionnels et structurés
- Utiliser un langage clair et juridiquement approprié
- Adapter le contenu aux informations fournies
- Créer des documents prêts à être utilisés après relecture

STYLE :
- Professionnel mais accessible
- Structuré avec des sections claires
- Précis dans les formulations
- Complet dans les informations`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 4000,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur API DeepSeek: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Réponse API invalide - Structure de données incorrecte');
        }
        
        return data.choices[0].message.content;
    }

    // ==================== AFFICHAGE RÉSULTATS ====================
    displayResult(content, formData) {
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div class="contract-result">
                    <h3>📄 ${this.getDocumentTypeLabel(formData.documentType)}</h3>
                    <div class="contract-content">${this.formatContractContent(content)}</div>
                    <button onclick="rhAssistant.downloadDocument('${formData.documentType}', '${formData.employeeName}')" class="download-btn">
                        💾 Télécharger le Document
                    </button>
                </div>
            `;
            resultDiv.style.display = 'block';
            
            // Scroll vers le résultat
            resultDiv.scrollIntoView({ behavior: 'smooth' });
        }
    }

    displayError(message) {
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div style="background: #f8d7da; color: #721c24; padding: 20px; border-radius: 8px; text-align: center;">
                    <h3 style="margin-bottom: 10px;">❌ Erreur de génération</h3>
                    <p style="margin-bottom: 15px;">${message}</p>
                    <button onclick="rhAssistant.configureAPIKey()" class="config-btn">
                        🔧 Reconfigurer l'API
                    </button>
                </div>
            `;
            resultDiv.style.display = 'block';
        }
    }

    showLoading(show) {
        const loadingDiv = document.getElementById('loading');
        const submitBtn = document.querySelector('#contractForm button[type="submit"]');
        
        if (loadingDiv) {
            loadingDiv.style.display = show ? 'block' : 'none';
        }
        if (submitBtn) {
            submitBtn.disabled = show;
            submitBtn.textContent = show ? '⏳ Génération en cours...' : '🚀 Générer le document';
        }
    }

    // ==================== FONCTIONS UTILITAIRES ====================
    formatContractContent(content) {
        // Convertir les retours à la ligne en HTML et améliorer la lisibilité
        return content
            .replace(/\n/g, '<br>')
            .replace(/(ARTICLE|CHAPITRE|SECTION|TITRE)\s+([IVXLCDM]+|\d+)/gi, '<br><strong>$1 $2</strong><br>')
            .replace(/(ENTRE LES SOUSSIGNÉS|CONTRAT DE TRAVAIL|PROCÈS-VERBAL|ATTESTATION)/gi, '<strong>$1</strong>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

    getDocumentTypeLabel(type) {
        const labels = {
            'cdi': 'Contrat de Travail CDI',
            'cdd': 'Contrat de Travail CDD', 
            'rupture': 'Rupture Conventionnelle',
            'avenant': 'Avenant au Contrat',
            'attestation': 'Attestation d\'Emploi'
        };
        return labels[type] || 'Document RH';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }

    downloadDocument(documentType, employeeName) {
        const contentElement = document.querySelector('.contract-content');
        if (!contentElement) {
            alert('❌ Aucun contenu à télécharger');
            return;
        }
        
        // Nettoyer le HTML pour avoir du texte brut
        const content = contentElement.innerText || contentElement.textContent;
        const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Nom du fichier
        const fileName = `${documentType}_${employeeName.replace(/\s+/g, '_')}_${this.getCurrentDate()}.txt`;
        a.download = fileName;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ Document téléchargé:', fileName);
    }

    getCurrentDate() {
        return new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
    }
}

// Initialisation de l'application
const rhAssistant = new RHAssistant();

// Exposer globalement pour les callbacks HTML
window.rhAssistant = rhAssistant;

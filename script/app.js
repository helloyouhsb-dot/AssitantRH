// scripts/app.js - VERSION FINALE SIMPLIFIÉE
class RHAssistant {
    constructor() {
        // REMPLACEZ PAR VOTRE VRAIE URL RENDER :
        this.backendURL = 'https://assitantrh.onrender.com'; // ← ICI !
        this.initializeApp();
    }

    initializeApp() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.setDefaultDate();
        });
    }

    setupEventListeners() {
        // Formulaire principal
        const contractForm = document.getElementById('contractForm');
        if (contractForm) {
            contractForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
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

    async generateDocument(formData) {
        console.log('📤 Envoi des données au backend...', formData);
        
        const response = await fetch(`${this.backendURL}/generate-document`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        console.log('📥 Réponse du backend:', response.status);

        if (!response.ok) {
            throw new Error(`Erreur serveur: ${response.status}`);
        }

        const data = await response.json();
        console.log('📄 Données reçues:', data);
        
        if (!data.success) {
            throw new Error(data.error || 'Erreur lors de la génération du document');
        }

        return data.document;
    }

    displayResult(content, formData) {
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div class="contract-result">
                    <h3>📄 ${this.getDocumentTypeLabel(formData.documentType)}</h3>
                    <div class="contract-content">${this.formatContractContent(content)}</div>
                    <button onclick="rhAssistant.downloadDocument('${formData.documentType}', '${formData.employeeName.replace(/'/g, "\\'")}')" class="download-btn">
                        💾 Télécharger le Document
                    </button>
                </div>
            `;
            resultDiv.style.display = 'block';
            
            // Scroll doux vers le résultat
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    displayError(message) {
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div class="error-message">
                    <h3>❌ Erreur de génération</h3>
                    <p>${message}</p>
                    <p style="margin-top: 15px; font-size: 14px; color: #666;">
                        Vérifiez votre connexion internet et réessayez.
                    </p>
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
            
            if (show) {
                submitBtn.style.opacity = '0.7';
            } else {
                submitBtn.style.opacity = '1';
            }
        }
    }

    formatContractContent(content) {
        if (!content) return '<p>Aucun contenu généré</p>';
        
        // Nettoyer et formater le contenu
        let formattedContent = content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
            
        // Améliorer la lisibilité des sections
        formattedContent = formattedContent
            .replace(/(ARTICLE|CHAPITRE|SECTION|TITRE)\s+([IVXLCDM]+|\d+)/gi, '<br><strong style="color: #2c3e50;">$1 $2</strong><br>')
            .replace(/(ENTRE LES SOUSSIGNÉS|CONTRAT DE TRAVAIL|PROCÈS-VERBAL|ATTESTATION)/gi, '<strong style="color: #2c3e50; font-size: 1.1em;">$1</strong>');
            
        return formattedContent;
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

    downloadDocument(documentType, employeeName) {
        const contentElement = document.querySelector('.contract-content');
        if (!contentElement) {
            alert('❌ Aucun contenu à télécharger');
            return;
        }
        
        try {
            // Nettoyer le HTML pour avoir du texte brut
            const content = contentElement.innerText || contentElement.textContent;
            const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Créer un nom de fichier propre
            const cleanName = employeeName.replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = `${documentType}_${cleanName}_${this.getCurrentDate()}.txt`;
            a.download = fileName;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✅ Document téléchargé:', fileName);
        } catch (error) {
            console.error('Erreur téléchargement:', error);
            alert('❌ Erreur lors du téléchargement');
        }
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

// Ajouter le CSS pour le message d'erreur si pas déjà présent
const style = document.createElement('style');
style.textContent = `
    .error-message {
        background: #f8d7da;
        color: #721c24;
        padding: 25px;
        border-radius: 10px;
        border: 1px solid #f5c6cb;
        text-align: center;
    }
    
    .error-message h3 {
        margin-bottom: 15px;
        color: #721c24;
    }
    
    .contract-content {
        line-height: 1.8;
        font-size: 15px;
        color: #333;
    }
    
    .contract-content strong {
        color: #2c3e50;
    }
`;
document.head.appendChild(style);

console.log('🚀 RHAI Assistant initialisé avec succès');

// scripts/app.js - VERSION FRONTEND COMPLÈTE
class RHAssistant {
    constructor() {
        // ⚠️ REMPLACEZ PAR VOTRE URL RENDER ⚠️
        this.backendURL = 'https://assitantrh.onrender.com';
        this.initializeApp();
    }

    initializeApp() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.setDefaultDate();
        });
    }

    setupEventListeners() {
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
            
            if (!this.validateForm(formData)) {
                throw new Error('Veuillez remplir tous les champs obligatoires');
            }

            const result = await this.generateDocument(formData);
            
            if (result.success) {
                this.displayResult(result.document, formData);
            } else {
                throw new Error(result.error || 'Erreur inconnue');
            }
            
        } catch (error) {
            console.error('Erreur:', error);
            this.displayError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    validateForm(formData) {
        return formData.documentType && 
               formData.companyName && 
               formData.employeeName && 
               formData.position && 
               formData.salary;
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
        console.log('📤 Envoi au backend...', formData);

        const response = await fetch(`${this.backendURL}/generate-document`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        console.log('📥 Réponse backend:', response.status);

        if (!response.ok) {
            throw new Error(`Erreur serveur: ${response.status}`);
        }

        return await response.json();
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
            resultDiv.scrollIntoView({ behavior: 'smooth' });
        }
    }

    displayError(message) {
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div class="error-message">
                    <h3>❌ Erreur</h3>
                    <p>${message}</p>
                    <p style="margin-top: 10px; font-size: 14px; color: #666;">
                        Si le problème persiste, vérifiez votre connexion.
                    </p>
                </div>
            `;
            resultDiv.style.display = 'block';
        }
    }

    showLoading(show) {
        const loadingDiv = document.getElementById('loading');
        const submitBtn = document.querySelector('#contractForm button[type="submit"]');
        
        if (loadingDiv) loadingDiv.style.display = show ? 'block' : 'none';
        if (submitBtn) {
            submitBtn.disabled = show;
            submitBtn.textContent = show ? '⏳ Génération...' : '🚀 Générer';
        }
    }

    formatContractContent(content) {
        return content.replace(/\n/g, '<br>');
    }

    getDocumentTypeLabel(type) {
        const labels = {
            'cdi': 'Contrat CDI', 'cdd': 'Contrat CDD', 
            'rupture': 'Rupture Conventionnelle', 'avenant': 'Avenant'
        };
        return labels[type] || 'Document RH';
    }

    downloadDocument(documentType, employeeName) {
        const contentElement = document.querySelector('.contract-content');
        if (!contentElement) return;
        
        const content = contentElement.innerText;
        const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${documentType}_${employeeName.replace(/\s+/g, '_')}.txt`;
        a.click();
    }
}

const rhAssistant = new RHAssistant();
window.rhAssistant = rhAssistant;

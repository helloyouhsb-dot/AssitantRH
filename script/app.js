// scripts/app.js - VERSION GITHUB PAGES
class RHAssistant {
    constructor() {
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
            const response = await fetch(`${this.backendURL}/generate-document`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Erreur serveur: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                this.displayResult(data.document, formData);
            } else {
                throw new Error(data.error || 'Erreur lors de la génération');
            }
            
        } catch (error) {
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

    displayResult(content, formData) {
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div class="document-result">
                    <h3>📄 ${this.getDocumentTypeLabel(formData.documentType)}</h3>
                    <div class="document-content">${content.replace(/\n/g, '<br>')}</div>
                    <button onclick="rhAssistant.downloadDocument('${formData.documentType}', '${formData.employeeName}')" class="download-btn">
                        💾 Télécharger le document
                    </button>
                </div>
            `;
            resultDiv.style.display = 'block';
        }
    }

    displayError(message) {
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div class="error-message">
                    <h3>❌ Erreur</h3>
                    <p>${message}</p>
                    <p style="margin-top: 10px; font-size: 14px;">
                        Vérifiez votre connexion et réessayez.
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
            submitBtn.textContent = show ? '⏳ Génération...' : '🚀 Générer le document';
        }
    }

    getDocumentTypeLabel(type) {
        const labels = {
            'cdi': 'Contrat CDI',
            'cdd': 'Contrat CDD', 
            'rupture': 'Rupture Conventionnelle'
        };
        return labels[type] || 'Document RH';
    }

    downloadDocument(documentType, employeeName) {
        const contentElement = document.querySelector('.document-content');
        if (!contentElement) return;
        
        const content = contentElement.innerText;
        const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${documentType}_${employeeName.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

const rhAssistant = new RHAssistant();
window.rhAssistant = rhAssistant;

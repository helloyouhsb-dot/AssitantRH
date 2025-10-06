// Configuration Firebase
const firebaseConfig = {
    apiKey: "votre-api-key",
    authDomain: "votre-projet.firebaseapp.com",
    projectId: "votre-projet",
    storageBucket: "votre-projet.appspot.com",
    messagingSenderId: "123456789",
    appId: "votre-app-id"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Dans firebase-config.js - ajouter Stripe
const PRICING_PLANS = {
    free: { documentsPerMonth: 3, features: ['CDI seulement'] },
    premium: { documentsPerMonth: 50, features: ['Tous documents', 'Export PDF', 'Sauvegarde cloud'] },
    pro: { documentsPerMonth: 500, features: ['Tous documents', 'Support prioritaire', 'API access'] }
};

function checkDocumentLimit(userPlan) {
    const user = getCurrentUser();
    const monthlyUsage = await getMonthlyUsage(user.uid);
    return monthlyUsage < PRICING_PLANS[userPlan].documentsPerMonth;
}

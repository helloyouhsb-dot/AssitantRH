class AuthManager {
    constructor() {
        this.currentUser = null;
    }
    
    // Inscription
    async signUp(email, password, companyName) {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        
        // Créer le profil utilisateur
        await db.collection('users').doc(userCredential.user.uid).set({
            email: email,
            companyName: companyName,
            createdAt: new Date()
        });
        
        this.currentUser = userCredential.user;
    }
    
    // Connexion
    async signIn(email, password) {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        this.currentUser = userCredential.user;
    }
}

require('dotenv').config();
const ElizaOS = require('./elizaOS');

async function main() {
    const elizaOS = new ElizaOS(
        process.env.RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc",
        process.env.GOVERNOR_ADDRESS,
        process.env.ELIZA_PRIVATE_KEY
    );

    // Démarrer l'écoute des événements
    await elizaOS.startListening();

    // Exemple d'analyse périodique
    setInterval(async () => {
        try {
            // Vérifier l'état de la DAO toutes les heures
            const context = await analyzeDaoState();
            if (context) {
                await elizaOS.analyzeAndDecide(context);
            }
        } catch (error) {
            console.error('Error in periodic check:', error);
        }
    }, 60 * 60 * 1000); // Toutes les heures
}

async function analyzeDaoState() {
    // Implémenter votre logique d'analyse de l'état de la DAO
    // Par exemple, vérifier le solde du trésor, les métriques de gouvernance, etc.
    return null;
}

main().catch(console.error);

require('dotenv').config();
const ElizaOS = require('./elizaOS');
const { handleProposal } = require('../scripts/eliza-governance');
const { fork } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
    const elizaOS = new ElizaOS(
        process.env.RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc"
    );

    // Démarrer le script de mise à jour de l'état de la DAO
    const daoStateUpdater = fork(path.join(__dirname, '../scripts/updateDaoState.js'));
    daoStateUpdater.on('error', (error) => {
        console.error('Erreur dans le script updateDaoState:', error);
    });

    // Démarrer l'écoute des événements
    await elizaOS.startListening();

    console.log("Starting to listen for events...");

    // Créer la première proposition immédiatement
    console.log("\nCréation de la première proposition...");
    handleProposal('create');

    // Pour vérifier si c'est la même proposition
    function getCurrentProposalId() {
        try {
            const proposalInfo = JSON.parse(
                fs.readFileSync(path.join(__dirname, '../scripts/current-proposal.json'))
            );
            return proposalInfo.proposalId;
        } catch (error) {
            console.error('Erreur lors de la lecture de current-proposal.json:', error);
            return null;
        }
    }

    let lastCheckedProposalId = getCurrentProposalId();

    // Vérifier l'état de la proposition toutes les minutes
    let checkInterval = setInterval(async () => {
        const currentProposalId = getCurrentProposalId();
        
        // Si l'ID a changé, mettre à jour notre référence
        if (currentProposalId !== lastCheckedProposalId) {
            console.log("\nNouvelle proposition détectée !");
            console.log("Ancien ID:", lastCheckedProposalId);
            console.log("Nouvel ID:", currentProposalId);
            lastCheckedProposalId = currentProposalId;
        }

        console.log("\n=== Vérification de la proposition ===");
        console.log("ID:", currentProposalId);
        const result = await handleProposal('execute');
        
        switch(result.status) {
            case 'executed':
                console.log("\n✅ Proposition exécutée avec succès !");
                if (getCurrentProposalId() === lastCheckedProposalId) {
                    console.log("\nCréation d'une nouvelle proposition...");
                    handleProposal('create');
                }
                break;
            
            case 'failed':
                console.log("\n❌ La proposition a échoué ou est expirée.");
                if (getCurrentProposalId() === lastCheckedProposalId) {
                    console.log("\nCréation d'une nouvelle proposition...");
                    handleProposal('create');
                }
                clearInterval(checkInterval);
                break;
            
            case 'pending':
                console.log("\n⏳ La proposition est en cours...");
                break;
            
            case 'error':
                console.log("\n⚠️ Erreur lors de l'exécution de la proposition");
                break;
        }
        
        console.log("\n=== Fin de la vérification ===\n");
    }, 60 * 1000); // 1 minute

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

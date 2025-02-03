require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { ethers } = require('ethers');

// Configuration
const DAO_STATE_PATH = path.join(__dirname, '../eliza/data/dao_state.json');
const UPDATE_INTERVAL = 30000; // 30 secondes

// Connexion à Arbitrum
const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_RPC_URL);
const daoContract = new ethers.Contract(
    process.env.GOVERNOR_ADDRESS,
    [
        "function getLatestProposal() view returns (string, string, uint256)",
        "function getVotingResults() view returns (uint256, uint256, uint256)",
        "function getTransactionCount() view returns (uint256)"
    ],
    provider
);

async function getCurrentDaoState() {
    try {
        // Lire l'état actuel de la DAO depuis la blockchain
        const [proposalName, status, voteCount] = await daoContract.getLatestProposal();
        const [yesVotes, noVotes, abstainVotes] = await daoContract.getVotingResults();
        const txCount = await daoContract.getTransactionCount();

        return {
            latest_proposal: proposalName,
            proposal_status: status,
            vote_count: voteCount.toString(),
            transaction_count: txCount.toNumber(),
            voting_results: `Pour: ${yesVotes}, Contre: ${noVotes}, Abstention: ${abstainVotes}`
        };
    } catch (error) {
        console.error('Error fetching DAO state:', error);
        // En cas d'erreur, retourner l'état actuel du fichier
        const currentContent = await fs.readFile(DAO_STATE_PATH, 'utf-8');
        return JSON.parse(currentContent);
    }
}

async function updateDaoState() {
    try {
        const newState = await getCurrentDaoState();
        await fs.writeFile(DAO_STATE_PATH, JSON.stringify(newState, null, 2));
        console.log('DAO state updated:', new Date().toISOString());
    } catch (error) {
        console.error('Error updating DAO state:', error);
    }
}

// Mettre à jour l'état toutes les 30 secondes
setInterval(updateDaoState, UPDATE_INTERVAL);

// Première mise à jour immédiate
updateDaoState();

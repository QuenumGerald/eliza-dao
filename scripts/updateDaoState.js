require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { ethers } = require('ethers');

// Configuration
const DAO_STATE_PATH = path.join(__dirname, '../eliza/data/dao_state.json');
const UPDATE_INTERVAL = 30000; // 30 secondes

// Connexion à Arbitrum
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const daoContract = new ethers.Contract(
    process.env.GOVERNOR_ADDRESS,
    [
        "function state(uint256 proposalId) public view returns (uint8)",
        "function proposalVotes(uint256 proposalId) external view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)",
        "function proposalDeadline(uint256 proposalId) external view returns (uint256)",
        "function proposalSnapshot(uint256 proposalId) external view returns (uint256)",
        "function proposalThreshold() external view returns (uint256)"
    ],
    provider
);

async function getCurrentDaoState() {
    try {
        // Lire le fichier current-proposal.json pour obtenir l'ID de la dernière proposition
        const proposalInfo = JSON.parse(
            await fs.readFile(path.join(__dirname, 'current-proposal.json'), 'utf-8')
        );

        const proposalId = proposalInfo.proposalId;
        const proposalState = await daoContract.state(proposalId);
        const { againstVotes, forVotes, abstainVotes } = await daoContract.proposalVotes(proposalId);
        const deadline = await daoContract.proposalDeadline(proposalId);
        const threshold = await daoContract.proposalThreshold();

        const states = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'];

        return {
            proposal_id: proposalId,
            description: proposalInfo.description,
            status: states[Number(proposalState)],
            deadline: deadline.toString(),
            threshold: ethers.formatEther(threshold),
            voting_results: {
                for: ethers.formatEther(forVotes),
                against: ethers.formatEther(againstVotes),
                abstain: ethers.formatEther(abstainVotes)
            },
            updated_at: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching DAO state:', error);
        // En cas d'erreur, retourner l'état actuel du fichier
        try {
            const currentContent = await fs.readFile(DAO_STATE_PATH, 'utf-8');
            return JSON.parse(currentContent);
        } catch (readError) {
            return {
                error: 'Unable to fetch DAO state',
                timestamp: new Date().toISOString()
            };
        }
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

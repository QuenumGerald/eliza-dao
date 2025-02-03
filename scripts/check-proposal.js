const ethers = require('ethers');
require('dotenv').config();
const { TOKEN_ADDRESS, GOVERNOR_ADDRESS } = require("./addresses");

const GOVERNOR_ABI = [
    "function state(uint256 proposalId) public view returns (uint8)",
    "function proposalVotes(uint256 proposalId) external view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)",
    "function proposalDeadline(uint256 proposalId) external view returns (uint256)",
    "function proposalSnapshot(uint256 proposalId) external view returns (uint256)",
    "function hasVoted(uint256 proposalId, address account) external view returns (bool)",
    "function getVotes(address account, uint256 blockNumber) external view returns (uint256)"
];

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc");
    const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
    console.log("Checking with account:", wallet.address);

    const governor = new ethers.Contract(GOVERNOR_ADDRESS, GOVERNOR_ABI, wallet);

    // Lire l'ID de la proposition depuis current-proposal.json
    const fs = require('fs');
    const path = require('path');
    const proposalInfo = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'current-proposal.json'))
    );
    const proposalId = proposalInfo.proposalId;

    console.log("\nProposition ID:", proposalId);
    console.log("Description:", proposalInfo.description);

    // Vérifier l'état
    const state = await governor.state(proposalId);
    const states = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'];
    console.log("\nÉtat actuel:", states[Number(state)]);

    // Vérifier les votes
    const { againstVotes, forVotes, abstainVotes } = await governor.proposalVotes(proposalId);
    console.log("\nVotes:");
    console.log("Pour:", ethers.formatEther(forVotes));
    console.log("Contre:", ethers.formatEther(againstVotes));
    console.log("Abstention:", ethers.formatEther(abstainVotes));

    // Vérifier si l'adresse a voté
    const hasVoted = await governor.hasVoted(proposalId, wallet.address);
    console.log("\nVotre vote:");
    console.log("A voté ?", hasVoted ? "Oui" : "Non");

    // Vérifier les délais
    const deadline = await governor.proposalDeadline(proposalId);
    const snapshot = await governor.proposalSnapshot(proposalId);
    const currentBlock = await provider.getBlockNumber();

    console.log("\nBlocs:");
    console.log("Bloc actuel:", currentBlock);
    console.log("Bloc snapshot:", Number(snapshot));
    console.log("Bloc deadline:", Number(deadline));
    console.log("Blocs restants:", Number(deadline) - currentBlock);

    // Vérifier le pouvoir de vote au moment du snapshot
    if (currentBlock >= Number(snapshot)) {
        const votingPower = await governor.getVotes(wallet.address, snapshot);
        console.log("\nPouvoir de vote au snapshot:", ethers.formatEther(votingPower));
    } else {
        console.log("\nLe snapshot n'a pas encore eu lieu");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

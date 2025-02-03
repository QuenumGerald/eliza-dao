const hre = require("hardhat");
const { TOKEN_ADDRESS, GOVERNOR_ADDRESS, RECIPIENT } = require("./addresses");
const { getProposalId, setProposalId } = require("./current-proposal");

// Récupérer l'ID de la proposition depuis les arguments
const proposalIdArg = process.argv[2];

const GOVERNOR_ABI = [
    "function state(uint256 proposalId) public view returns (uint8)",
    "function castVote(uint256 proposalId, uint8 support) external returns (uint256)",
    "function proposalVotes(uint256 proposalId) external view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)",
    "function proposalDeadline(uint256 proposalId) external view returns (uint256)"
];

const TOKEN_ABI = [
    "function balanceOf(address account) external view returns (uint256)",
    "function getVotes(address account) external view returns (uint256)",
    "function delegate(address delegatee) external"
];

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Casting vote with account:", deployer.address);

    // Récupérer l'instance du Governor
    const governor = new hre.ethers.Contract(GOVERNOR_ADDRESS, GOVERNOR_ABI, deployer);
    const token = new hre.ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, deployer);

    // Utiliser l'ID fourni en argument ou celui du fichier
    let proposalId;
    if (proposalIdArg) {
        proposalId = BigInt(proposalIdArg);
        // Sauvegarder le nouvel ID
        setProposalId(proposalId);
        console.log("Using provided proposal ID:", proposalId);
    } else {
        proposalId = getProposalId();
        console.log("Using saved proposal ID:", proposalId);
    }

    // Vérifier l'état de la proposition
    const state = await governor.state(proposalId);
    const states = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'];
    console.log("\nCurrent state:", states[Number(state)]);

    if (Number(state) === 1) { // Active
        // Voter pour la proposition (1 = Pour, 0 = Contre, 2 = Abstention)
        console.log("\nVoting for proposal...");
        const tx = await governor.castVote(proposalId, 1);
        const receipt = await tx.wait();
        console.log("Vote cast! Transaction receipt:", receipt.hash);

        // Afficher le nombre de votes
        const { againstVotes, forVotes, abstainVotes } = await governor.proposalVotes(proposalId);
        console.log("\nCurrent votes:");
        console.log("For:", hre.ethers.formatEther(forVotes));
        console.log("Against:", hre.ethers.formatEther(againstVotes));
        console.log("Abstain:", hre.ethers.formatEther(abstainVotes));

        // Afficher les délais
        const deadline = await governor.proposalDeadline(proposalId);
        const currentBlock = await hre.ethers.provider.getBlockNumber();
        console.log("\nVoting period:");
        console.log("Current block:", currentBlock);
        console.log("Deadline block:", Number(deadline));
        console.log("Blocks remaining:", Number(deadline) - currentBlock);
    } else {
        console.error("Error: Proposal must be in Active state to vote");
        console.log("Current state:", states[Number(state)]);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

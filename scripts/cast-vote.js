const hre = require("hardhat");
const { TOKEN_ADDRESS, GOVERNOR_ADDRESS, RECIPIENT } = require("./addresses");
const { getProposalId, setProposalId } = require("./current-proposal");

// Récupérer l'ID de la proposition depuis les arguments
const proposalIdArg = process.argv[2];

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Casting vote with account:", deployer.address);

    // Récupérer l'instance du Governor
    const governor = await ethers.getContractAt("ElizaGovernor", GOVERNOR_ADDRESS);
    const token = await ethers.getContractAt("ElizaToken", TOKEN_ADDRESS);

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
        console.log("For:", ethers.formatEther(forVotes));
        console.log("Against:", ethers.formatEther(againstVotes));
        console.log("Abstain:", ethers.formatEther(abstainVotes));

        // Afficher les délais
        const deadline = await governor.proposalDeadline(proposalId);
        const currentBlock = await ethers.provider.getBlockNumber();
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

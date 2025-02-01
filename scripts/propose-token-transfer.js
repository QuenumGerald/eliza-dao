const hre = require("hardhat");
const fs = require('fs');
const path = require('path');
const { TOKEN_ADDRESS, GOVERNOR_ADDRESS, RECIPIENT } = require("./addresses");
const { setProposalId } = require("./current-proposal");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Creating proposal with account:", deployer.address);

    // Récupérer les instances des contrats
    const governor = await ethers.getContractAt("ElizaGovernor", GOVERNOR_ADDRESS);
    const token = await ethers.getContractAt("ElizaToken", TOKEN_ADDRESS);

    // Vérifier que le proposeur a le rôle ELIZA_ROLE
    const ELIZA_ROLE = await governor.ELIZA_ROLE();
    const hasRole = await governor.hasRole(ELIZA_ROLE, deployer.address);
    if (!hasRole) {
        console.error("Error: Account does not have ELIZA_ROLE");
        return;
    }
    console.log("Account has ELIZA_ROLE ✓");

    // Vérifier les votes
    const votes = await token.getVotes(deployer.address);
    const threshold = await governor.proposalThreshold();
    console.log("\nVoting power check:");
    console.log("Current votes:", ethers.formatEther(votes));
    console.log("Proposal threshold:", ethers.formatEther(threshold));

    // Déléguer les votes si nécessaire
    if (votes < threshold) {
        console.log("\nDelegating votes...");
        const delegateTx = await token.delegate(deployer.address);
        await delegateTx.wait();
        console.log("Votes delegated ✓");
        
        const newVotes = await token.getVotes(deployer.address);
        console.log("New voting power:", ethers.formatEther(newVotes));
    }

    // Encoder l'appel à transfer
    const transferCalldata = token.interface.encodeFunctionData("transfer", [
        RECIPIENT,
        ethers.parseEther("50") // 50 tokens
    ]);

    // Lire et incrémenter le compteur de propositions
    const counterFile = path.join(__dirname, 'proposal-counter.json');
    let counter = { lastId: 0 };
    if (fs.existsSync(counterFile)) {
        counter = JSON.parse(fs.readFileSync(counterFile, 'utf8'));
    }
    counter.lastId++;
    fs.writeFileSync(counterFile, JSON.stringify(counter, null, 2));

    // Description de la proposition avec ID
    const description = `Proposition #${counter.lastId} - Transfert de 50.0 tokens à ${RECIPIENT}`;

    try {
        // Créer la proposition
        console.log("\nCreating proposal...");
        console.log("Description:", description);

        const tx = await governor.proposeByEliza(
            [TOKEN_ADDRESS], // targets
            [0], // values
            [transferCalldata], // calldatas
            description // description
        );

        const receipt = await tx.wait();
        console.log("Proposal created! Transaction receipt:", receipt.hash);

        // Récupérer l'ID de la proposition
        const proposalId = await governor.hashProposal(
            [TOKEN_ADDRESS],
            [0],
            [transferCalldata],
            ethers.keccak256(ethers.toUtf8Bytes(description))
        );
        
        // Sauvegarder l'ID et la description pour les autres scripts
        setProposalId(proposalId, description);
        
        console.log("\nProposal ID:", proposalId);

        // Afficher l'état de la proposition
        const state = await governor.state(proposalId);
        const states = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'];
        console.log("Initial state:", states[Number(state)]);

        // Afficher les délais
        const snapshot = await governor.proposalSnapshot(proposalId);
        const deadline = await governor.proposalDeadline(proposalId);
        const currentBlock = await ethers.provider.getBlockNumber();

        console.log("\nTiming:");
        console.log("Current block:", currentBlock);
        console.log("Snapshot block:", Number(snapshot));
        console.log("Deadline block:", Number(deadline));
        console.log("Blocks until start:", Number(snapshot) - currentBlock);
        console.log("Voting duration:", Number(deadline) - Number(snapshot), "blocks");

    } catch (error) {
        console.error("\nError creating proposal:");
        console.error("Message:", error.message);
        if (error.data) {
            console.error("Data:", error.data);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

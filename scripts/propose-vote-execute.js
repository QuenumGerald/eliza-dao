const hre = require("hardhat");
const { TOKEN_ADDRESS, GOVERNOR_ADDRESS, RECIPIENT } = require("./addresses");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Starting governance process with account:", deployer.address);

    // Récupérer les instances des contrats
    const governor = await ethers.getContractAt("ElizaGovernor", GOVERNOR_ADDRESS);
    const token = await ethers.getContractAt("ElizaToken", TOKEN_ADDRESS);

    // Vérifier le rôle ELIZA
    const ELIZA_ROLE = await governor.ELIZA_ROLE();
    const hasRole = await governor.hasRole(ELIZA_ROLE, deployer.address);
    if (!hasRole) {
        console.error("Error: Account does not have ELIZA_ROLE");
        return;
    }
    console.log("Account has ELIZA_ROLE ✓");

    // Vérifier le solde du Governor
    const governorBalance = await token.balanceOf(GOVERNOR_ADDRESS);
    console.log("\nGovernor balance:", ethers.formatEther(governorBalance), "tokens");

    if (governorBalance < ethers.parseEther("50")) {
        console.error("Error: Governor does not have enough tokens");
        return;
    }

    // Approuver le transfert
    console.log("\nApproving transfer...");
    const approveTx = await token.connect(await ethers.getImpersonatedSigner(GOVERNOR_ADDRESS)).approve(
        GOVERNOR_ADDRESS,
        ethers.parseEther("50")
    );
    await approveTx.wait();
    console.log("Transfer approved ✓");

    // Déléguer les votes au proposant
    console.log("\nDelegating votes...");
    const delegateTx = await token.delegate(deployer.address);
    await delegateTx.wait();
    console.log("Votes delegated ✓");

    // 1. Créer la proposition
    console.log("\n1. Creating proposal...");
    const transferCalldata = token.interface.encodeFunctionData("transfer", [
        RECIPIENT,
        ethers.parseEther("50") // 50 tokens
    ]);

    const description = `Proposition de transfert de 50.0 tokens à ${RECIPIENT}`;
    console.log("Description:", description);

    const proposeTx = await governor.proposeByEliza(
        [TOKEN_ADDRESS],
        [0],
        [transferCalldata],
        description
    );
    const proposeReceipt = await proposeTx.wait();
    console.log("Proposal created! Transaction:", proposeReceipt.hash);

    // Récupérer l'ID de la proposition
    const proposalId = await governor.hashProposal(
        [TOKEN_ADDRESS],
        [0],
        [transferCalldata],
        ethers.keccak256(ethers.toUtf8Bytes(description))
    );
    console.log("Proposal ID:", proposalId);

    // 2. Attendre que la proposition soit active
    console.log("\n2. Waiting for proposal to be active...");
    let state;
    const states = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'];

    while (true) {
        state = await governor.state(proposalId);
        console.log("Current state:", states[Number(state)]);

        if (Number(state) === 1) { // Active
            break;
        } else if (Number(state) > 1) {
            console.error("Proposal state advanced too quickly");
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 5000)); // Attendre 5 secondes
    }

    // 3. Voter
    console.log("\n3. Casting vote...");
    const voteTx = await governor.castVote(proposalId, 1); // 1 = Pour
    const voteReceipt = await voteTx.wait();
    console.log("Vote cast! Transaction:", voteReceipt.hash);

    // Afficher les votes
    const { againstVotes, forVotes, abstainVotes } = await governor.proposalVotes(proposalId);
    console.log("\nCurrent votes:");
    console.log("For:", ethers.formatEther(forVotes));
    console.log("Against:", ethers.formatEther(againstVotes));
    console.log("Abstain:", ethers.formatEther(abstainVotes));

    // 4. Attendre que la proposition soit exécutable
    console.log("\n4. Waiting for proposal to be executable...");
    while (true) {
        state = await governor.state(proposalId);
        console.log("Current state:", states[Number(state)]);

        if (Number(state) === 4) { // Succeeded
            break;
        } else if (Number(state) !== 1) { // Si pas Active ou Succeeded
            console.error("Proposal failed or expired");
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 5000)); // Attendre 5 secondes
    }

    // 5. Exécuter la proposition
    console.log("\n5. Executing proposal...");
    const executeTx = await governor.execute(
        [TOKEN_ADDRESS],
        [0],
        [transferCalldata],
        ethers.keccak256(ethers.toUtf8Bytes(description))
    );
    const executeReceipt = await executeTx.wait();
    console.log("Proposal executed! Transaction:", executeReceipt.hash);

    // Vérifier le résultat
    const balance = await token.balanceOf(RECIPIENT);
    console.log("\nFinal balance of recipient:", ethers.formatEther(balance), "tokens");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

const hre = require("hardhat");
const { TOKEN_ADDRESS, GOVERNOR_ADDRESS, RECIPIENT } = require("./addresses");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Executing proposal with account:", deployer.address);

    // Récupérer les instances des contrats
    const governor = await ethers.getContractAt("ElizaGovernor", GOVERNOR_ADDRESS);
    const token = await ethers.getContractAt("ElizaToken", TOKEN_ADDRESS);

    // Vérifier que l'exécuteur a le rôle ELIZA_ROLE
    const ELIZA_ROLE = await governor.ELIZA_ROLE();
    const hasRole = await governor.hasRole(ELIZA_ROLE, deployer.address);
    if (!hasRole) {
        console.error("Error: Account does not have ELIZA_ROLE");
        return;
    }
    console.log("Account has ELIZA_ROLE ");

    // Encoder l'appel à transfer
    const transferCalldata = token.interface.encodeFunctionData("transfer", [
        RECIPIENT,
        ethers.parseEther("50") // 50 tokens
    ]);

    // Description de la proposition
    const description = `Proposition de transfert de 50.0 tokens à ${RECIPIENT}`;

    // Récupérer l'ID de la proposition
    const proposalId = await governor.hashProposal(
        [TOKEN_ADDRESS],
        [0],
        [transferCalldata],
        ethers.keccak256(ethers.toUtf8Bytes(description))
    );

    try {
        // Vérifier l'état de la proposition
        const state = await governor.state(proposalId);
        const states = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'];
        console.log("\nCurrent state:", states[Number(state)]);

        if (state !== 4) { // 4 = Succeeded
            console.error("Error: Proposal must be in Succeeded state to be executed");
            return;
        }

        // Exécuter la proposition
        console.log("\nExecuting proposal...");
        const tx = await governor.execute(
            [TOKEN_ADDRESS],
            [0],
            [transferCalldata],
            ethers.keccak256(ethers.toUtf8Bytes(description))
        );

        const receipt = await tx.wait();
        console.log("Proposal executed! Transaction receipt:", receipt.hash);

        // Vérifier le nouvel état
        const newState = await governor.state(proposalId);
        console.log("New state:", states[Number(newState)]);

    } catch (error) {
        console.error("\nError executing proposal:");
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

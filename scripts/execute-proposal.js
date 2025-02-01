const hre = require("hardhat");
const fs = require('fs');
const path = require('path');
const { TOKEN_ADDRESS, GOVERNOR_ADDRESS, RECIPIENT } = require("./addresses");
const { getProposalId, setProposalId, getProposalDescription } = require("./current-proposal");

// Récupérer l'ID de la proposition depuis les arguments
const proposalIdArg = process.argv[2];

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Executing proposal with account:", deployer.address);

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

    // Récupérer la description de la proposition
    const description = getProposalDescription();
    console.log("Using description:", description);

    // Vérifier l'état de la proposition
    const state = await governor.state(proposalId);
    const states = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'];
    console.log("\nCurrent state:", states[Number(state)]);

    // Vérifier si la proposition peut être exécutée
    if (Number(state) === 4) { // Succeeded
        console.log("\nExecuting proposal...");
        const tx = await governor.execute(
            [TOKEN_ADDRESS],
            [0],
            [token.interface.encodeFunctionData("transfer", [
                RECIPIENT,
                ethers.parseEther("50")
            ])],
            ethers.keccak256(ethers.toUtf8Bytes(description))
        );
        const receipt = await tx.wait();
        console.log("Proposal executed! Transaction receipt:", receipt.hash);

        // Vérifier le nouveau solde
        const balance = await token.balanceOf(RECIPIENT);
        console.log("\nNew balance of recipient:", ethers.formatEther(balance), "tokens");
    } else {
        console.error("Error: Proposal must be in Succeeded state to be executed");
        console.log("Current state:", states[Number(state)]);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

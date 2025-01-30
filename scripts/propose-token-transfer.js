const hre = require("hardhat");
const deployedAddresses = require('../deployed-addresses.json');

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Creating proposal with account:", deployer.address);

    // Récupérer l'adresse du contrat Governor et Token depuis le fichier deployed-addresses.json
    const GOVERNOR_ADDRESS = deployedAddresses.governor;
    const TOKEN_ADDRESS = deployedAddresses.token;
    
    // Configuration du transfert
    const RECIPIENT_ADDRESS = "0x..." // TODO: Remplacer par l'adresse du destinataire
    const AMOUNT = ethers.parseEther("100"); // 100 tokens

    // Récupérer l'instance du Governor
    const governor = await ethers.getContractAt("ElizaGovernor", GOVERNOR_ADDRESS);
    const token = await ethers.getContractAt("ElizaToken", TOKEN_ADDRESS);

    // Encoder l'appel de la fonction transfer
    const transferCalldata = token.interface.encodeFunctionData("transfer", [
        RECIPIENT_ADDRESS,
        AMOUNT
    ]);

    // Créer la proposition
    console.log("Creating proposal for token transfer...");
    const tx = await governor.proposeByEliza(
        [TOKEN_ADDRESS], // targets
        [0], // values (0 ETH car c'est un transfert de tokens)
        [transferCalldata], // calldatas
        `Proposition de transfert de ${ethers.formatEther(AMOUNT)} tokens à ${RECIPIENT_ADDRESS}`
    );

    const receipt = await tx.wait();
    
    // Récupérer l'ID de la proposition depuis l'événement
    const proposalCreatedEvent = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === 'ProposalCreated'
    );
    
    if (proposalCreatedEvent) {
        const proposalId = proposalCreatedEvent.args.proposalId;
        console.log("Proposal created successfully!");
        console.log("Proposal ID:", proposalId.toString());
        console.log("Recipient:", RECIPIENT_ADDRESS);
        console.log("Amount:", ethers.formatEther(AMOUNT), "tokens");
    } else {
        console.error("Failed to get proposal ID from event");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

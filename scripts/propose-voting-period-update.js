const hre = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Creating proposal with account:", deployer.address);

    // Adresse du Governor sur arbitrumSepolia
    const GOVERNOR_ADDRESS = "0xC0D4835806942cDfEcBb01173b6eE9f52a48EB83";
    
    // Récupérer l'instance du Governor
    const governor = await ethers.getContractAt("ElizaGovernor", GOVERNOR_ADDRESS);

    // Vérifier la période de vote actuelle
    const currentPeriod = await governor.votingPeriod();
    console.log("Current voting period:", currentPeriod.toString(), "blocks");

    // Nouvelle période de vote : 5 minutes (environ 300 blocs)
    const newVotingPeriod = 300;
    console.log("Proposing new voting period:", newVotingPeriod, "blocks");

    // Encoder l'appel à setVotingPeriod
    const setVotingPeriodCall = governor.interface.encodeFunctionData("setVotingPeriod", [newVotingPeriod]);

    // Créer la proposition
    console.log("Creating proposal...");
    const tx = await governor.proposeByEliza(
        [GOVERNOR_ADDRESS], // target (le contrat governor lui-même)
        [0], // value (pas d'ETH à envoyer)
        [setVotingPeriodCall], // calldata
        `Modifier la période de vote de ${currentPeriod} à ${newVotingPeriod} blocs (5 minutes)`
    );

    console.log("Waiting for transaction...");
    const receipt = await tx.wait();
    
    // Récupérer l'ID de la proposition
    const proposalCreatedEvent = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === 'ProposalCreated'
    );
    
    if (proposalCreatedEvent) {
        const proposalId = proposalCreatedEvent.args.proposalId;
        console.log("\nProposal created successfully!");
        console.log("Proposal ID:", proposalId.toString());
        
        console.log("\nNext steps:");
        console.log("1. Attendez 1 bloc");
        console.log("2. Exécutez scripts/cast-vote.js pour voter");
        console.log("3. Une fois la proposition acceptée, exécutez scripts/execute-proposal.js");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

const hre = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Casting vote with account:", deployer.address);

    // Adresse du Governor sur arbitrumSepolia
    const GOVERNOR_ADDRESS = "0xC0D4835806942cDfEcBb01173b6eE9f52a48EB83";
    
    // ID de la proposition
    const proposalId = "71499009109457454779755948961893965479217128072539397713930701211944569465078";

    // Récupérer l'instance du Governor
    const governor = await ethers.getContractAt("ElizaGovernor", GOVERNOR_ADDRESS);

    // Vérifier l'état de la proposition
    const state = await governor.state(proposalId);
    console.log("State (raw):", state);
    const states = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'];
    console.log("Proposal state:", states[Number(state)]);

    // Vérifier le snapshot et deadline
    const proposal = await governor.proposalSnapshot(proposalId);
    const deadline = await governor.proposalDeadline(proposalId);
    const currentBlock = await ethers.provider.getBlockNumber();
    
    console.log("\nBlock info:");
    console.log("Current block:", currentBlock);
    console.log("Snapshot block:", proposal);
    console.log("Deadline block:", deadline);

    if (Number(state) === 1) { // Active
        console.log("\nCasting vote...");
        // Vote en faveur (1 = Pour, 0 = Contre, 2 = Abstention)
        const voteTx = await governor.castVote(proposalId, 1);
        await voteTx.wait();
        console.log("Vote cast successfully!");

        // Vérifier le nombre de votes
        const { againstVotes, forVotes, abstainVotes } = await governor.proposalVotes(proposalId);
        console.log("\nCurrent votes:");
        console.log("For:", ethers.formatEther(forVotes));
        console.log("Against:", ethers.formatEther(againstVotes));
        console.log("Abstain:", ethers.formatEther(abstainVotes));
    } else {
        console.log("\nCannot vote - proposal is not active");
        if (Number(state) === 0) {
            const votingDelay = await governor.votingDelay();
            console.log(`Wait ${votingDelay} blocks before voting`);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

const hre = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Executing proposal with account:", deployer.address);

    // Adresse du Governor sur arbitrumSepolia
    const GOVERNOR_ADDRESS = "0xC0D4835806942cDfEcBb01173b6eE9f52a48EB83";
    
    // ID de la proposition
    const proposalId = "54188877995308189203490749216417784763951196217721542437514733114102371680848";

    // Récupérer l'instance du Governor
    const governor = await ethers.getContractAt("ElizaGovernor", GOVERNOR_ADDRESS);

    // Vérifier l'état de la proposition
    const state = await governor.state(proposalId);
    const states = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'];
    console.log("Proposal state:", states[state]);

    // Récupérer les détails de la proposition depuis l'événement de création
    const filter = governor.filters.ProposalCreated(proposalId);
    const events = await governor.queryFilter(filter);
    
    if (events.length === 0) {
        console.error("Proposal not found");
        return;
    }

    const proposalDetails = events[0].args;
    const { targets, values, calldatas, description } = proposalDetails;

    if (state === 4) { // Succeeded
        console.log("Executing proposal...");
        const executeTx = await governor.execute(
            targets,
            values,
            calldatas,
            ethers.keccak256(ethers.toUtf8Bytes(description))
        );
        await executeTx.wait();
        console.log("Proposal executed successfully!");

        // Vérifier la nouvelle période de vote
        const newVotingPeriod = await governor.votingPeriod();
        console.log("New voting period:", newVotingPeriod.toString(), "blocks");
    } else {
        console.log("Cannot execute - proposal is not in succeeded state");
        if (state === 1) { // Active
            const { againstVotes, forVotes, abstainVotes } = await governor.proposalVotes(proposalId);
            console.log("\nCurrent votes:");
            console.log("For:", ethers.formatEther(forVotes));
            console.log("Against:", ethers.formatEther(againstVotes));
            console.log("Abstain:", ethers.formatEther(abstainVotes));
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

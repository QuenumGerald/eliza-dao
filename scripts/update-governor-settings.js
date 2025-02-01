const hre = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Updating governor settings with account:", deployer.address);

    // Récupérer l'instance du Governor sur arbitrumSepolia
    const GOVERNOR_ADDRESS = "0x9C2a0562b395E09b81265C568B55D164230a0939"; // Adresse sur arbitrumSepolia
    const governor = await ethers.getContractAt("ElizaGovernor", GOVERNOR_ADDRESS);

    // Modifier la période de vote à 5 minutes (environ 300 blocs)
    console.log("Setting voting period to 300 blocks (~5 minutes)...");
    const votingPeriodTx = await governor.setVotingPeriod(300);
    await votingPeriodTx.wait();
    console.log("Voting period updated!");

    // Vérifier les nouveaux paramètres
    const newVotingPeriod = await governor.votingPeriod();
    console.log("New voting period:", newVotingPeriod.toString(), "blocks");

    // Note: Le quorum ne peut pas être modifié directement car il est fixé dans le constructeur
    // Pour le modifier, il faudrait déployer un nouveau contrat
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

const hre = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // 1. Déployer le token
    console.log("\nDeploying ElizaToken...");
    const ElizaToken = await ethers.getContractFactory("ElizaToken");
    const token = await ElizaToken.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("ElizaToken deployed to:", tokenAddress);

    // 2. Déployer le Governor
    console.log("\nDeploying ElizaGovernor...");
    const ElizaGovernor = await ethers.getContractFactory("ElizaGovernor");
    const governor = await ElizaGovernor.deploy(token);
    await governor.waitForDeployment();
    const governorAddress = await governor.getAddress();
    console.log("ElizaGovernor deployed to:", governorAddress);

    // 3. Donner le rôle ELIZA au deployer
    console.log("\nGranting ELIZA_ROLE to deployer...");
    const ELIZA_ROLE = await governor.ELIZA_ROLE();
    await governor.grantRole(ELIZA_ROLE, deployer.address);
    console.log("ELIZA_ROLE granted to deployer");

    // 4. Déléguer les votes
    console.log("\nDelegating votes to deployer...");
    await token.delegate(deployer.address);
    console.log("Votes delegated");

    // Afficher toutes les adresses
    console.log("\nContract Addresses:");
    console.log("TOKEN_ADDRESS:", tokenAddress);
    console.log("GOVERNOR_ADDRESS:", governorAddress);
    console.log("RECIPIENT:", deployer.address);

    // Créer le fichier addresses.js
    const fs = require("fs");
    const addresses = `module.exports = {
    TOKEN_ADDRESS: "${tokenAddress}",
    GOVERNOR_ADDRESS: "${governorAddress}",
    RECIPIENT: "${deployer.address}"
};`;

    fs.writeFileSync("scripts/addresses.js", addresses);
    console.log("\nAddresses written to scripts/addresses.js");

    // Vérifier les configurations
    console.log("\nVerifying configurations...");
    const votingDelay = await governor.votingDelay();
    const votingPeriod = await governor.votingPeriod();
    const proposalThreshold = await governor.proposalThreshold();
    const quorum = await governor.quorumNumerator();

    console.log("Voting Delay:", votingDelay.toString(), "blocks");
    console.log("Voting Period:", votingPeriod.toString(), "blocks");
    console.log("Proposal Threshold:", ethers.formatEther(proposalThreshold), "tokens");
    console.log("Quorum:", quorum.toString(), "%");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

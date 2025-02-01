const hre = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // 1. Déployer ElizaToken
    console.log("\nDeploying ElizaToken...");
    const ElizaToken = await ethers.getContractFactory("ElizaToken");
    const token = await ElizaToken.deploy();
    await token.waitForDeployment();
    console.log("ElizaToken deployed to:", await token.getAddress());

    // 2. Déployer ElizaTimelock
    console.log("\nDeploying ElizaTimelock...");
    const minDelay = 1; // 1 seconde de délai minimum
    const proposers = [deployer.address]; // Le déployeur peut proposer
    const executors = [deployer.address]; // Le déployeur peut exécuter
    const admin = deployer.address; // Le déployeur est admin

    const ElizaTimelock = await ethers.getContractFactory("ElizaTimelock");
    const timelock = await ElizaTimelock.deploy(
        minDelay,
        proposers,
        executors,
        admin
    );
    await timelock.waitForDeployment();
    console.log("ElizaTimelock deployed to:", await timelock.getAddress());

    // 3. Déployer ElizaGovernor
    console.log("\nDeploying ElizaGovernor...");
    const ElizaGovernor = await ethers.getContractFactory("ElizaGovernor");
    const governor = await ElizaGovernor.deploy(
        await token.getAddress(),
        await timelock.getAddress()
    );
    await governor.waitForDeployment();
    console.log("ElizaGovernor deployed to:", await governor.getAddress());

    // 4. Configurer les rôles
    console.log("\nConfiguring roles...");
    
    // Donner le rôle ELIZA_ROLE au déployeur
    const ELIZA_ROLE = await governor.ELIZA_ROLE();
    await governor.grantElizaRole(deployer.address);
    console.log("ELIZA_ROLE granted to deployer");

    // Donner les permissions au Governor dans le Timelock
    const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
    const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
    const CANCELLER_ROLE = await timelock.CANCELLER_ROLE();
    const TIMELOCK_ADMIN_ROLE = await timelock.TIMELOCK_ADMIN_ROLE();

    await timelock.grantRole(PROPOSER_ROLE, await governor.getAddress());
    await timelock.grantRole(EXECUTOR_ROLE, await governor.getAddress());
    await timelock.grantRole(CANCELLER_ROLE, await governor.getAddress());
    
    // Révoquer le rôle admin du déployeur pour le timelock
    await timelock.revokeRole(TIMELOCK_ADMIN_ROLE, deployer.address);

    console.log("\nDeployment complete! Contract addresses:");
    console.log("- ElizaToken:", await token.getAddress());
    console.log("- ElizaTimelock:", await timelock.getAddress());
    console.log("- ElizaGovernor:", await governor.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

const hre = require("hardhat");
const { GOVERNOR_ADDRESS } = require("./addresses");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Checking ELIZA_ROLE for account:", deployer.address);

    // Récupérer l'instance du Governor
    const governor = await ethers.getContractAt("ElizaGovernor", GOVERNOR_ADDRESS);

    // Vérifier le rôle ELIZA_ROLE
    const ELIZA_ROLE = await governor.ELIZA_ROLE();
    const hasRole = await governor.hasRole(ELIZA_ROLE, deployer.address);
    console.log("Has ELIZA_ROLE:", hasRole);

    // Vérifier le rôle ADMIN_ROLE
    const ADMIN_ROLE = await governor.ADMIN_ROLE();
    const hasAdminRole = await governor.hasRole(ADMIN_ROLE, deployer.address);
    console.log("Has ADMIN_ROLE:", hasAdminRole);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

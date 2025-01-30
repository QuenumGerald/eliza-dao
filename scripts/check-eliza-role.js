const hre = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Checking ELIZA_ROLE for account:", deployer.address);

    // Adresse du Governor sur arbitrumSepolia
    const GOVERNOR_ADDRESS = "0xC0D4835806942cDfEcBb01173b6eE9f52a48EB83";
    
    // Récupérer l'instance du Governor
    const governor = await ethers.getContractAt("ElizaGovernor", GOVERNOR_ADDRESS);

    // Récupérer le hash du rôle ELIZA_ROLE
    const ELIZA_ROLE = await governor.ELIZA_ROLE();
    console.log("ELIZA_ROLE hash:", ELIZA_ROLE);

    // Vérifier si le compte a le rôle
    const hasRole = await governor.hasRole(ELIZA_ROLE, deployer.address);
    console.log("Has ELIZA_ROLE:", hasRole);

    // Récupérer l'admin du rôle
    const adminRole = await governor.getRoleAdmin(ELIZA_ROLE);
    console.log("Admin role hash:", adminRole);

    // Vérifier si le compte est admin
    const isAdmin = await governor.hasRole(adminRole, deployer.address);
    console.log("Is admin:", isAdmin);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

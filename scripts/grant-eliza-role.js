const hre = require("hardhat");
const { GOVERNOR_ADDRESS } = require("./addresses");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Granting ELIZA_ROLE with account:", deployer.address);

    // Utiliser l'adresse du déployeur
    const ELIZA_ADDRESS = deployer.address;
    
    // Récupérer l'instance du Governor
    const governor = await ethers.getContractAt("ElizaGovernor", GOVERNOR_ADDRESS);

    // Donner le rôle ELIZA_ROLE au wallet du déployeur
    console.log("Granting ELIZA_ROLE to:", ELIZA_ADDRESS);
    const tx = await governor.grantElizaRole(ELIZA_ADDRESS);
    await tx.wait();
    
    console.log("ELIZA_ROLE granted successfully!");

    // Vérifier que le rôle a bien été attribué
    const ELIZA_ROLE = await governor.ELIZA_ROLE();
    const hasRole = await governor.hasRole(ELIZA_ROLE, ELIZA_ADDRESS);
    console.log("Role verification:", hasRole ? "Success" : "Failed");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

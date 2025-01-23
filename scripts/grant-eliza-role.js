const hre = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Granting ELIZA_ROLE with account:", deployer.address);

    // Adresse du wallet d'Eliza
    const ELIZA_ADDRESS = "0xE5237343D34b4b201FA0B681C689660cc6Def199";
    
    // Adresse du contrat Governor
    const GOVERNOR_ADDRESS = "0xC0D4835806942cDfEcBb01173b6eE9f52a48EB83";

    // Récupérer l'instance du Governor
    const governor = await ethers.getContractAt("ElizaGovernor", GOVERNOR_ADDRESS);

    // Donner le rôle ELIZA_ROLE au wallet d'Eliza
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

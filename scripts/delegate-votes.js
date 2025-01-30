const hre = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Delegating votes for account:", deployer.address);

    // Adresse du token sur arbitrumSepolia
    const TOKEN_ADDRESS = "0x98eDc5E454E309614Fe6C6df2095B8EeDb829181";
    
    // Récupérer l'instance du token
    const token = await ethers.getContractAt("ElizaToken", TOKEN_ADDRESS);

    // Déléguer les votes à soi-même
    console.log("Delegating votes to self...");
    const tx = await token.delegate(deployer.address);
    await tx.wait();
    
    // Vérifier le nouveau pouvoir de vote
    const votes = await token.getVotes(deployer.address);
    console.log("New voting power:", ethers.formatEther(votes), "votes");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

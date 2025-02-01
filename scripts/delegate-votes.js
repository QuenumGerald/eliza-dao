const hre = require("hardhat");
const { TOKEN_ADDRESS } = require("./addresses");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Delegating votes with account:", deployer.address);

    // Récupérer l'instance du Token
    const token = await ethers.getContractAt("ElizaToken", TOKEN_ADDRESS);

    // Déléguer les votes au déployeur
    console.log("Delegating votes to self...");
    const tx = await token.delegate(deployer.address);
    await tx.wait();

    // Vérifier les votes délégués
    const votes = await token.getVotes(deployer.address);
    console.log("Current voting power:", ethers.formatEther(votes), "votes");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

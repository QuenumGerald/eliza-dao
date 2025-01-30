const hre = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Checking balance for account:", deployer.address);

    // Adresse du token sur arbitrumSepolia
    const TOKEN_ADDRESS = "0x98eDc5E454E309614Fe6C6df2095B8EeDb829181"; // Remplacer par la bonne adresse
    
    // Récupérer l'instance du token
    const token = await ethers.getContractAt("ElizaToken", TOKEN_ADDRESS);

    // Vérifier le solde
    const balance = await token.balanceOf(deployer.address);
    console.log("Token balance:", ethers.formatEther(balance), "ELIZA");

    // Vérifier le pouvoir de vote
    const votes = await token.getVotes(deployer.address);
    console.log("Voting power:", ethers.formatEther(votes), "votes");

    // Vérifier le supply total
    const totalSupply = await token.totalSupply();
    console.log("Total supply:", ethers.formatEther(totalSupply), "ELIZA");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

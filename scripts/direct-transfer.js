const hre = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Transferring tokens with account:", deployer.address);

    // Adresses des contrats
    const TOKEN_ADDRESS = "0x2a298Cd0c40C4E71BD6308151AA3437A0E8EC648";
    const RECIPIENT = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    
    // Récupérer l'instance du token
    const token = await ethers.getContractAt("ElizaToken", TOKEN_ADDRESS);

    // Vérifier les balances avant
    const deployerBalance = await token.balanceOf(deployer.address);
    const recipientBalance = await token.balanceOf(RECIPIENT);
    
    console.log("\nBalances avant:");
    console.log("- Deployer:", ethers.formatEther(deployerBalance));
    console.log("- Recipient:", ethers.formatEther(recipientBalance));

    try {
        console.log("\nTransférant 50 tokens à", RECIPIENT);
        const tx = await token.transfer(RECIPIENT, ethers.parseEther("50"), {
            gasLimit: 1000000
        });
        
        console.log("\nWaiting for transaction...");
        const receipt = await tx.wait();
        console.log("Transaction receipt:", receipt);
        console.log("Transfert réussi ! 🎉");

        // Vérifier les balances après
        const newRecipientBalance = await token.balanceOf(RECIPIENT);
        const newDeployerBalance = await token.balanceOf(deployer.address);
        console.log("\nBalances après:");
        console.log("- Deployer:", ethers.formatEther(newDeployerBalance));
        console.log("- Recipient:", ethers.formatEther(newRecipientBalance));
    } catch (error) {
        console.error("\nError executing transfer:");
        console.error("- Message:", error.message);
        if (error.data) {
            console.error("- Data:", error.data);
        }
        if (error.transaction) {
            console.error("- Transaction:", error.transaction);
        }
        if (error.receipt) {
            console.error("- Receipt:", error.receipt);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

const hre = require("hardhat");
const { TOKEN_ADDRESS, TIMELOCK_ADDRESS } = require("./addresses");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Approving Timelock with account:", deployer.address);

    // Récupérer l'instance du Token
    const token = await ethers.getContractAt("ElizaToken", TOKEN_ADDRESS);

    // Donner une grande allowance au Timelock
    const amount = ethers.parseEther("1000000"); // 1M tokens
    console.log("Approving Timelock to spend tokens...");
    const tx = await token.approve(TIMELOCK_ADDRESS, amount);
    await tx.wait();

    // Vérifier l'allowance
    const allowance = await token.allowance(deployer.address, TIMELOCK_ADDRESS);
    console.log("Timelock allowance:", ethers.formatEther(allowance), "tokens");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

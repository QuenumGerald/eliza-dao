const hre = require("hardhat");
const { ethers } = require("hardhat");
const { GOVERNOR_ADDRESS } = require("./addresses");

async function main() {
    const [admin] = await ethers.getSigners();
    console.log("Granting ELIZA_ROLE with account:", admin.address);

    // Get the governor contract
    const governor = await ethers.getContractAt("ElizaGovernor", GOVERNOR_ADDRESS);

    // Get the ELIZA_ROLE
    const ELIZA_ROLE = await governor.ELIZA_ROLE();
    console.log("ELIZA_ROLE:", ELIZA_ROLE);

    // Get Eliza's address from private key
    const elizaWallet = new ethers.Wallet(process.env.ELIZA_PRIVATE_KEY);
    console.log("Eliza's address:", elizaWallet.address);

    // Check if Eliza already has the role
    const hasRole = await governor.hasRole(ELIZA_ROLE, elizaWallet.address);
    if (hasRole) {
        console.log("Eliza already has ELIZA_ROLE");
        return;
    }

    // Grant ELIZA_ROLE to Eliza
    console.log("Granting ELIZA_ROLE to Eliza...");
    const tx = await governor.grantRole(ELIZA_ROLE, elizaWallet.address);
    await tx.wait();
    console.log("ELIZA_ROLE granted successfully!");

    // Verify
    const hasRoleAfter = await governor.hasRole(ELIZA_ROLE, elizaWallet.address);
    console.log("Role verification:", hasRoleAfter ? "Success " : "Failed ");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

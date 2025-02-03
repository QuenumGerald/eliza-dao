const ethers = require('ethers');
require('dotenv').config();
const { TOKEN_ADDRESS } = require("./addresses");

const TOKEN_ABI = [
    "function balanceOf(address account) external view returns (uint256)",
    "function getVotes(address account) external view returns (uint256)",
    "function delegates(address account) external view returns (address)"
];

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc");
    const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
    console.log("Checking voting power for:", wallet.address);

    const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, wallet);

    // Vérifier le solde de tokens
    const balance = await token.balanceOf(wallet.address);
    console.log("\nBalance de tokens:", ethers.formatEther(balance));

    // Vérifier le pouvoir de vote
    const votes = await token.getVotes(wallet.address);
    console.log("Pouvoir de vote:", ethers.formatEther(votes));

    // Vérifier la délégation
    const delegate = await token.delegates(wallet.address);
    console.log("Délégué à:", delegate);
    console.log("Self-délégation?", delegate.toLowerCase() === wallet.address.toLowerCase());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

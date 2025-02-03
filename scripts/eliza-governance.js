const ethers = require('ethers');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { TOKEN_ADDRESS, GOVERNOR_ADDRESS, RECIPIENT } = require("./addresses");

const GOVERNOR_ABI = [
    "function proposeByEliza(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description) external returns (uint256)",
    "function state(uint256 proposalId) public view returns (uint8)",
    "function execute(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash) external payable returns (uint256)",
    "function ELIZA_ROLE() external view returns (bytes32)",
    "function hasRole(bytes32 role, address account) external view returns (bool)",
    "function proposalThreshold() external view returns (uint256)",
    "function proposalSnapshot(uint256 proposalId) external view returns (uint256)",
    "function proposalDeadline(uint256 proposalId) external view returns (uint256)",
    "function proposalVotes(uint256 proposalId) external view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)",
    "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)",
    "function hashProposal(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash) external pure returns (uint256)"
];

const TOKEN_ABI = [
    "function balanceOf(address account) external view returns (uint256)",
    "function getVotes(address account) external view returns (uint256)",
    "function delegate(address delegatee) external",
    "function transfer(address to, uint256 amount) external returns (bool)"
];

// Pour stocker les infos de proposition
function saveProposalInfo(proposalId, description) {
    fs.writeFileSync(
        path.join(__dirname, 'current-proposal.json'),
        JSON.stringify({
            proposalId: proposalId.toString(),
            description: description
        }, null, 2)
    );
}

async function checkAndExecuteProposal(proposalId, description) {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc");
    const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
    console.log("Checking proposal with account (admin):", wallet.address);
    console.log("Proposal ID:", proposalId.toString());

    // Récupérer l'instance du Governor
    const governor = new ethers.Contract(GOVERNOR_ADDRESS, GOVERNOR_ABI, wallet);
    const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, wallet);

    // Vérifier l'état de la proposition
    const state = await governor.state(proposalId);
    const states = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'];
    console.log("\nCurrent state:", states[Number(state)]);

    // Afficher les votes actuels
    const { againstVotes, forVotes, abstainVotes } = await governor.proposalVotes(proposalId);
    console.log("\nVotes actuels:");
    console.log("Pour:", ethers.formatEther(forVotes));
    console.log("Contre:", ethers.formatEther(againstVotes));
    console.log("Abstention:", ethers.formatEther(abstainVotes));

    // Vérifier le seuil de vote
    const threshold = await governor.proposalThreshold();
    console.log("\nSeuil de vote requis:", ethers.formatEther(threshold));
    console.log("Votes Pour > Seuil ?", forVotes > threshold ? "Oui" : "Non");
    console.log("Votes Pour > Votes Contre ?", forVotes > againstVotes ? "Oui" : "Non");

    // Afficher les délais
    const deadline = await governor.proposalDeadline(proposalId);
    const currentBlock = await provider.getBlockNumber();
    console.log("\nTiming:");
    console.log("Current block:", currentBlock);
    console.log("Deadline block:", Number(deadline));
    console.log("Blocks remaining:", Number(deadline) - currentBlock);

    // Vérifier l'état et agir en conséquence
    switch(Number(state)) {
        case 4: // Succeeded
            console.log("\nLa proposition a réussi ! Exécution...");
            try {
                const tx = await governor.execute(
                    [TOKEN_ADDRESS],
                    [0],
                    [token.interface.encodeFunctionData("transfer", [
                        RECIPIENT,
                        ethers.parseEther("50")
                    ])],
                    ethers.keccak256(ethers.toUtf8Bytes(description))
                );
                const receipt = await tx.wait();
                console.log("Proposal executed! Transaction receipt:", receipt.hash);

                // Vérifier le nouveau solde
                const balance = await token.balanceOf(RECIPIENT);
                console.log("\nNew balance of recipient:", ethers.formatEther(balance), "tokens");
                return { status: 'executed' };
            } catch (error) {
                console.error("Error executing proposal:", error.message);
                return { status: 'error' };
            }

        case 7: // Executed
            console.log("La proposition a déjà été exécutée");
            return { status: 'executed' };

        case 3: // Defeated
        case 6: // Expired
            console.log("La proposition a échoué ou est expirée");
            return { status: 'failed' };

        case 1: // Active
            console.log("La proposition est active");
            return { status: 'pending' };

        default:
            console.log("État actuel:", states[Number(state)]);
            return { status: 'pending' };
    }
}

async function createAndMonitorProposal() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc");
    const wallet = new ethers.Wallet(process.env.ELIZA_PRIVATE_KEY, provider);
    console.log("Creating proposal with account (Eliza):", wallet.address);

    // Récupérer les instances des contrats
    const governor = new ethers.Contract(GOVERNOR_ADDRESS, GOVERNOR_ABI, wallet);
    const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, wallet);

    // Vérifier que le proposeur a le rôle ELIZA_ROLE
    const ELIZA_ROLE = await governor.ELIZA_ROLE();
    const hasRole = await governor.hasRole(ELIZA_ROLE, wallet.address);
    if (!hasRole) {
        console.error("Error: Account does not have ELIZA_ROLE");
        return;
    }
    console.log("Account has ELIZA_ROLE ✓");

    // Lire et incrémenter le compteur de propositions
    const counterFile = path.join(__dirname, 'proposal-counter.json');
    let counter = { lastId: 0 };
    
    try {
        counter = JSON.parse(fs.readFileSync(counterFile, 'utf8'));
    } catch (error) {
        console.log("Counter file not found, starting from 0");
    }
    
    counter.lastId++;
    fs.writeFileSync(counterFile, JSON.stringify(counter, null, 2));

    console.log("\nCreating proposal...");
    const description = `Proposition #${counter.lastId} - Transfert de 50.0 tokens à ${RECIPIENT}`;
    console.log("Description:", description);

    try {
        const tx = await governor.propose(
            [TOKEN_ADDRESS],
            [0],
            [token.interface.encodeFunctionData("transfer", [
                RECIPIENT,
                ethers.parseEther("50")
            ])],
            description
        );

        const receipt = await tx.wait();
        const event = receipt.logs.find(
            log => log.fragment && log.fragment.name === 'ProposalCreated'
        );

        if (event) {
            const proposalId = event.args[0];
            saveProposalInfo(proposalId, description);
            console.log("Proposal created successfully!");
            return { status: 'success' };
        }
    } catch (error) {
        console.error("Error creating proposal:");
        console.error("Message:", error.message);
        console.error("Data:", error.data);
        return { status: 'error' };
    }
}

// Fonction principale qui sera appelée par ElizaOS
async function handleProposal(action = 'create') {
    if (action === 'create') {
        return await createAndMonitorProposal();
    } else if (action === 'execute') {
        // Lire les infos de la proposition actuelle
        const proposalInfo = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'current-proposal.json'))
        );
        return await checkAndExecuteProposal(
            BigInt(proposalInfo.proposalId),
            proposalInfo.description
        );
    }
}

module.exports = {
    handleProposal
};

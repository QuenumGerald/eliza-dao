const ethers = require('ethers');
require('dotenv').config();
const { TOKEN_ADDRESS, GOVERNOR_ADDRESS, RECIPIENT } = require('../scripts/addresses');
const { handleProposal } = require('../scripts/eliza-governance');

class ElizaOS {
    constructor(providerUrl) {
        this.provider = new ethers.JsonRpcProvider(providerUrl);
        this.governorContract = new ethers.Contract(
            GOVERNOR_ADDRESS,
            [
                "function proposeByEliza(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description) external returns (uint256)",
                "function state(uint256 proposalId) public view returns (uint8)",
                "function execute(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash) external payable returns (uint256)",
                "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)"
            ],
            this.provider
        );

        // Configuration des grants
        this.lastGrantDistribution = 0;
        this.GRANT_INTERVAL = 365 * 24 * 60 * 60; // 365 jours en secondes
        this.GRANT_PERCENTAGE = 5; // 5% par an
        this.treasuryAddress = RECIPIENT; // Utiliser RECIPIENT comme adresse du trésor
    }

    async checkAndProposeGrants() {
        try {
            const currentTime = Math.floor(Date.now() / 1000);
            
            // Vérifier si une année s'est écoulée depuis la dernière distribution
            if (currentTime >= this.lastGrantDistribution + this.GRANT_INTERVAL) {
                console.log('Distribution de grants due');

                // Récupérer le solde total du trésor
                const treasuryBalance = await this.provider.getBalance(this.treasuryAddress);
                
                // Calculer 5% du solde
                const grantAmount = treasuryBalance * BigInt(this.GRANT_PERCENTAGE) / BigInt(100);
                
                console.log('Montant des grants:', ethers.formatEther(grantAmount), 'ETH');

                // Créer une proposition pour transférer les fonds au wallet d'Eliza
                const targets = [this.treasuryAddress];
                const values = [grantAmount]; // Montant à transférer
                const calldatas = ["0x"]; // Pas besoin d'encodage spécial pour un simple transfert
                const description = `Distribution annuelle de grants (5% du trésor) : ${ethers.formatEther(grantAmount)} ETH`;

                const result = await handleProposal('create');
                if (result) {
                    this.lastGrantDistribution = currentTime;
                    console.log('Proposition de grants créée:', result.proposalId);
                    return result.proposalId;
                }
            } else {
                const timeLeft = (this.lastGrantDistribution + this.GRANT_INTERVAL) - currentTime;
                console.log(`Prochaine distribution de grants dans ${Math.floor(timeLeft / (24 * 60 * 60))} jours`);
                return null;
            }
        } catch (error) {
            console.error('Erreur lors de la vérification des grants:', error);
            throw error;
        }
    }

    async makeProposal(targets, values, calldatas, description) {
        try {
            const result = await handleProposal('create');
            if (result) {
                console.log('Proposal created:', result.proposalId);
                return result.proposalId;
            }
            return null;
        } catch (error) {
            console.error('Error creating proposal:', error);
            throw error;
        }
    }

    async checkProposalState(proposalId) {
        const state = await this.governorContract.state(proposalId);
        const states = [
            'Pending',
            'Active',
            'Canceled',
            'Defeated',
            'Succeeded',
            'Queued',
            'Expired',
            'Executed'
        ];
        return states[state];
    }

    async analyzeAndDecide(context) {
        // Vérifier d'abord si une distribution de grants est due
        const grantsProposal = await this.checkAndProposeGrants();
        if (grantsProposal) {
            return grantsProposal;
        }

        // Continuer avec les autres analyses
        if (context.type === 'treasury_low') {
            const result = await handleProposal('create');
            if (result) {
                return result.proposalId;
            }
        }

        return null;
    }

    async startListening() {
        console.log('Starting to listen for events...');

        this.governorContract.on('ProposalCreated',
            async (proposalId, proposer, targets, values, signatures, calldatas, startBlock, endBlock, description) => {
                console.log('New proposal created:', {
                    proposalId,
                    proposer,
                    description
                });

                // Surveiller l'état de la proposition
                const state = await this.checkProposalState(proposalId);
                if (state === 'Succeeded') {
                    // Tenter d'exécuter la proposition
                    await handleProposal('execute');
                }
            }
        );
    }

    async analyzeProposal(proposalId, description) {
        console.log('Analyzing proposal:', proposalId);
        const state = await this.checkProposalState(proposalId);
        if (state === 'Succeeded') {
            // Tenter d'exécuter la proposition
            await handleProposal('execute');
        }
    }
}

module.exports = ElizaOS;

const ethers = require('ethers');
require('dotenv').config();
const deployedAddresses = require('../deployed-addresses.json');

class ElizaOS {
    constructor(providerUrl, governorAddress) {
        this.provider = new ethers.JsonRpcProvider(providerUrl);
        this.governorContract = new ethers.Contract(
            governorAddress,
            [
                "function proposeByEliza(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description) external returns (uint256)",
                "function state(uint256 proposalId) public view returns (uint8)",
                "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)"
            ],
            this.provider
        );

        // Configuration des grants
        this.lastGrantDistribution = 0;
        this.GRANT_INTERVAL = 365 * 24 * 60 * 60; // 365 jours en secondes
        this.GRANT_PERCENTAGE = 5; // 5% par an
        this.treasuryAddress = deployedAddresses.treasury;
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

                const proposalId = await this.governorContract.proposeByEliza(targets, values, calldatas, description);
                
                if (proposalId) {
                    this.lastGrantDistribution = currentTime;
                    console.log('Proposition de grants créée:', proposalId);
                }

                return proposalId;
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
            const tx = await this.governorContract.proposeByEliza(
                targets,
                values,
                calldatas,
                description
            );
            const receipt = await tx.wait();
            console.log('Proposal created:', receipt);

            // Trouver l'ID de la proposition dans les événements
            const event = receipt.logs.find(
                log => log.topics[0] === ethers.id("ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)")
            );

            if (event) {
                const proposalId = event.topics[1];
                console.log('Proposal ID:', proposalId);
                return proposalId;
            }
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
            const proposal = {
                targets: [this.treasuryAddress],
                values: [ethers.parseEther("1.0")],
                calldatas: [
                    "0x"
                ],
                description: "Proposition to replenish treasury"
            };

            return await this.makeProposal(
                proposal.targets,
                proposal.values,
                proposal.calldatas,
                proposal.description
            );
        }

        return null;
    }

    async startListening() {
        console.log('Starting to listen for events...');

        this.governorContract.on('ProposalCreated',
            (proposalId, proposer, targets, values, signatures, calldatas, startBlock, endBlock, description) => {
                console.log('New proposal created:', {
                    proposalId,
                    proposer,
                    description
                });

                // Analyser la proposition si nécessaire
                this.analyzeProposal(proposalId, description);
            }
        );
    }

    async analyzeProposal(proposalId, description) {
        console.log('Analyzing proposal:', proposalId);
        // Implémenter votre logique d'analyse ici
    }
}

module.exports = ElizaOS;

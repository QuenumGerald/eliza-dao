const ethers = require('ethers');
require('dotenv').config();

class ElizaOS {
    constructor(providerUrl, governorAddress, privateKey) {
        this.provider = new ethers.JsonRpcProvider(providerUrl);
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        this.governorContract = new ethers.Contract(
            governorAddress,
            [
                "function proposeByEliza(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description) external returns (uint256)",
                "function state(uint256 proposalId) public view returns (uint8)",
                "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)"
            ],
            this.wallet
        );
    }

    // Faire une proposition à la DAO
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

    // Vérifier l'état d'une proposition
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

    // Analyser une situation et prendre une décision
    async analyzeAndDecide(context) {
        // Ici, vous pouvez intégrer votre logique d'IA pour analyser le contexte
        // et décider si une proposition doit être faite
        
        // Exemple simple :
        if (context.type === 'treasury_low') {
            const proposal = {
                targets: [context.treasuryAddress],
                values: [ethers.parseEther('1.0')],
                calldatas: [
                    ethers.Interface.getSighash('replenishTreasury()')
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

    // Écouter les événements pertinents
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

    // Analyser une proposition
    async analyzeProposal(proposalId, description) {
        console.log('Analyzing proposal:', proposalId);
        // Implémenter votre logique d'analyse ici
    }
}

module.exports = ElizaOS;

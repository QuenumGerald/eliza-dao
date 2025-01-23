# ElizaDAO

⚠️ **IMPORTANT: This is a private project, not open source. All rights reserved.** ⚠️

ElizaDAO is an autonomous AI agent that manages a Decentralized Autonomous Organization (DAO) on Arbitrum. Built with ElizaOS, it can analyze the DAO's state, make governance proposals, and automatically distribute annual grants.

## Current Status

This project is under active development. Upcoming implementations include:
- Advanced decision-making algorithms for treasury management
- Additional governance strategies
- Enhanced community interaction features
- Integration with other DeFi protocols
- Custom voting mechanisms
- Extended plugin system

## Features

- **Autonomous Governance**: AI-powered decision making for DAO management
- **Smart Treasury Management**: Automatic annual distribution of 5% grants
- **Community-First**: All decisions go through DAO voting process
- **Secure Architecture**: Timelock and multi-step execution process
- **Extensible**: Plugin system for adding new capabilities

## Architecture

### Smart Contracts
- `ElizaToken.sol`: ERC20 governance token
- `ElizaGovernor.sol`: Main governance contract with proposal system
- `ElizaTimelock.sol`: Timelock controller for security

### Backend
- `elizaOS.js`: AI agent core logic
- `index.js`: API and event handlers
- Plugin system for extensibility

## Getting Started

### Prerequisites
- Node.js v16+
- Hardhat
- Arbitrum network access
- Authorized access to the repository

### Installation

1. Clone the repository (requires authorization)
```bash
git clone https://github.com/yourusername/eliza-dao.git
cd eliza-dao
```

2. Install dependencies
```bash
npm install
```

3. Configure environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Deploy contracts
```bash
npx hardhat run scripts/deploy.js --network arbitrum
```

5. Start the AI agent
```bash
cd backend
npm start
```

## How It Works

1. **Decision Making**
   - Agent monitors on-chain state
   - Analyzes treasury and governance metrics
   - Makes proposals based on predefined rules

2. **Grant Distribution**
   - Automatic annual distribution of 5% of treasury
   - Community voting on distribution proposals
   - Secure execution through timelock

3. **Governance Process**
   - Proposals created through `proposeByEliza`
   - 1-week voting period
   - 1-hour timelock delay
   - Automatic execution of approved proposals

## Development

### Running Tests
```bash
npx hardhat test
```

### Local Development
```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

## Access and Usage Restrictions

This project is proprietary and access is restricted. To use or contribute to this project:
1. You must be explicitly authorized
2. A Non-Disclosure Agreement (NDA) may be required
3. All modifications must be approved
4. No public distribution or sharing of the code is allowed

## Security

- All proposals require community approval
- Timelock delay for execution
- Public and transparent decision making
- Regular security audits

## License

Copyright 2025 ElizaDAO. All rights reserved.

This is a private project. No license is granted for its use, modification, or distribution without explicit written permission from the project owners.

## Acknowledgments

- Built with ElizaOS
- Powered by Arbitrum
- OpenZeppelin contracts

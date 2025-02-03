export interface DaoState {
    name: string;
    description: string;
    members: string[];
    proposals: Proposal[];
    treasury: Treasury;
    settings: DaoSettings;
}

export interface Proposal {
    id: string;
    title: string;
    description: string;
    proposer: string;
    status: ProposalStatus;
    votes: Vote[];
    createdAt: string;
    expiresAt: string;
}

export type ProposalStatus = 'active' | 'passed' | 'rejected' | 'executed';

export interface Vote {
    voter: string;
    choice: boolean;
    votingPower: number;
    timestamp: string;
}

export interface Treasury {
    balance: number;
    transactions: Transaction[];
}

export interface Transaction {
    id: string;
    type: 'deposit' | 'withdrawal';
    amount: number;
    from: string;
    to: string;
    timestamp: string;
    description: string;
}

export interface DaoSettings {
    votingPeriod: number; // in seconds
    quorum: number; // percentage required for proposal to pass
    minimumVotingPower: number;
    proposalThreshold: number;
}

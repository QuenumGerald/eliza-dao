export interface DaoState {
    latest_proposal: string;
    proposal_status: string;
    vote_count: string;
    transaction_count: number;
    voting_results: string;
}

export interface DaoAction {
    type: "UPDATE_STATE";
    payload: Partial<DaoState>;
}

export interface DaoEvaluation {
    valid: boolean;
    error?: string;
    data?: DaoState;
}

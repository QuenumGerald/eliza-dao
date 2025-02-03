import type { Evaluator, IAgentRuntime, Memory, State } from "@elizaos/core";
import { DaoState } from "../types/index";

export const daoStateEvaluator: Evaluator = {
    name: "daoState",
    description: "Evaluates the current state of the DAO",
    similes: [],
    examples: [],
    async validate(runtime: IAgentRuntime, message: Memory): Promise<boolean> {
        // Check if the message contains DAO state related content
        return message.content.text.toLowerCase().includes('dao') || 
               message.content.text.toLowerCase().includes('proposal') ||
               message.content.text.toLowerCase().includes('vote');
    },
    async handler(runtime: IAgentRuntime, _message: Memory, state?: State) {
        const daoState = state as unknown as DaoState;
        try {
            // Vérifier si l'état de la DAO est valide
            if (!daoState?.name || !daoState?.description || !Array.isArray(daoState?.members) || !Array.isArray(daoState?.proposals)) {
                return {
                    valid: false,
                    error: "Invalid DAO state: missing required fields"
                };
            }

            // Vérifier les paramètres de configuration
            if (!daoState?.settings || 
                typeof daoState?.settings.votingPeriod !== 'number' ||
                typeof daoState?.settings.quorum !== 'number' ||
                typeof daoState?.settings.minimumVotingPower !== 'number' ||
                typeof daoState?.settings.proposalThreshold !== 'number') {
                return {
                    valid: false,
                    error: "Invalid DAO state: invalid settings"
                };
            }

            // Vérifier le trésor
            if (!daoState?.treasury || typeof daoState?.treasury.balance !== 'number' || !Array.isArray(daoState?.treasury.transactions)) {
                return {
                    valid: false,
                    error: "Invalid DAO state: invalid treasury"
                };
            }

            return {
                valid: true,
                data: daoState
            };
        } catch (error) {
            return {
                valid: false,
                error: `Failed to evaluate DAO state: ${error}`
            };
        }
    }
};

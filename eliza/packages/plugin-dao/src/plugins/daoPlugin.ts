import type { Plugin } from "@elizaos/core";
import { updateDaoStateAction } from "../actions/updateDaoStateAction";
import { daoStateProvider } from "../providers/daoStateProvider";
import { daoStateEvaluator } from "../evaluators/daoStateEvaluator";
import DaoService from "../services/daoService";

export const daoPlugin: Plugin = {
    name: "dao",
    description: "Plugin for managing DAO state and interactions",
    actions: [updateDaoStateAction],
    providers: [daoStateProvider],
    evaluators: [daoStateEvaluator],
    services: [new DaoService()],
    clients: [],
};

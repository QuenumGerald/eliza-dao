import { Service, ServiceType } from "@elizaos/core";
import { DaoState } from "../types";
import * as fs from "fs/promises";
import * as path from "path";

export default class DaoService implements Service {
    name = "dao";
    description = "Service for managing DAO state and operations";
    serviceType: ServiceType = ServiceType.TEXT_GENERATION;

    async initialize() {
        // Initialisation du service
        console.log("DAO service initialized");
    }

    async getCurrentState(): Promise<DaoState> {
        const daoStatePath = path.join(process.cwd(), "eliza/data/dao_state.json");
        const daoStateContent = await fs.readFile(daoStatePath, "utf-8");
        return JSON.parse(daoStateContent);
    }

    async updateState(newState: Partial<DaoState>): Promise<void> {
        const daoStatePath = path.join(process.cwd(), "eliza/data/dao_state.json");
        const currentState = await this.getCurrentState();
        const updatedState = { ...currentState, ...newState };
        await fs.writeFile(daoStatePath, JSON.stringify(updatedState, null, 2));
    }
}

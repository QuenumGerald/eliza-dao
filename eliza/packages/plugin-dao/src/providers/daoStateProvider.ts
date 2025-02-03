import type { Provider } from "@elizaos/core";
import { DaoState } from "../types";
import * as fs from "fs/promises";
import * as path from "path";

export const daoStateProvider: Provider = {
    async get(): Promise<DaoState> {
        try {
            const daoStatePath = path.join(process.cwd(), "eliza/data/dao_state.json");
            const daoStateContent = await fs.readFile(daoStatePath, "utf-8");
            return JSON.parse(daoStateContent);
        } catch (error) {
            throw new Error(`Failed to read DAO state: ${error}`);
        }
    }
};

// Variable pour stocker les infos de la proposition actuelle
let proposalInfo = {
    id: null,
    description: null
};

module.exports = {
    setProposalId: (id, description) => {
        proposalInfo.id = id;
        proposalInfo.description = description;
        // Sauvegarder les infos dans un fichier
        require('fs').writeFileSync(
            require('path').join(__dirname, 'current-proposal.json'),
            JSON.stringify({
                proposalId: id.toString(),
                description: description
            }, null, 2)
        );
    },
    getProposalId: () => {
        if (!proposalInfo.id) {
            // Essayer de lire depuis le fichier
            try {
                const saved = JSON.parse(
                    require('fs').readFileSync(
                        require('path').join(__dirname, 'current-proposal.json')
                    )
                );
                proposalInfo.id = BigInt(saved.proposalId);
                proposalInfo.description = saved.description;
            } catch (e) {
                console.error("No proposal info found");
                process.exit(1);
            }
        }
        return proposalInfo.id;
    },
    getProposalDescription: () => {
        if (!proposalInfo.description) {
            // Essayer de lire depuis le fichier
            try {
                const saved = JSON.parse(
                    require('fs').readFileSync(
                        require('path').join(__dirname, 'current-proposal.json')
                    )
                );
                proposalInfo.id = BigInt(saved.proposalId);
                proposalInfo.description = saved.description;
            } catch (e) {
                console.error("No proposal info found");
                process.exit(1);
            }
        }
        return proposalInfo.description;
    }
};

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/governance/utils/IVotes.sol";

contract ElizaGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    AccessControl
{
    // Rôles spécifiques
    bytes32 public constant ELIZA_ROLE = keccak256("ELIZA_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    constructor(IVotes _token)
        Governor("ElizaGovernor")
        GovernorSettings(
            1, // Voting delay: 1 block
            30, // Voting period: 30 blocks
            1 // Proposal threshold
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% quorum
    {
        // Assigner les rôles initiaux
        _grantRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ELIZA_ROLE, ADMIN_ROLE);
    }

    // Permet à Eliza de proposer des décisions
    function proposeByEliza(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) external onlyRole(ELIZA_ROLE) returns (uint256) {
        return propose(targets, values, calldatas, description);
    }

    // Gestion des rôles par l'admin
    function grantElizaRole(address elizaAddress) external onlyRole(ADMIN_ROLE) {
        grantRole(ELIZA_ROLE, elizaAddress);
    }

    function revokeElizaRole(address elizaAddress) external onlyRole(ADMIN_ROLE) {
        revokeRole(ELIZA_ROLE, elizaAddress);
    }

    // The following functions are overrides required by Solidity
    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract ElizaToken is ERC20, ERC20Permit, ERC20Votes {
    constructor()
        ERC20("ElizaToken", "ELIZA")
        ERC20Permit("ElizaToken")
    {
        _mint(msg.sender, 1_000_000 * 10 ** decimals()); // 1M tokens
    }

    // The following functions are overrides required by Solidity
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._update(from, to, amount);
    }

    function nonces(address owner) 
        public 
        view 
        override(ERC20Permit, Nonces) 
        returns (uint256) 
    {
        return super.nonces(owner);
    }
}

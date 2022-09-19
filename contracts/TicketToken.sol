// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import this file to use console.log

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
contract TicketToken is ERC20Burnable, AccessControl{

    bytes32 constant MANAGER = 0xaf290d8680820aad922855f39b306097b20e28774d6c1ad35a20325630c3a02c; 
    constructor(string memory _name, string memory _symbol, uint _amount) ERC20(_name, _symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE,msg.sender);
        _setupRole(MANAGER,msg.sender);
        _mint(msg.sender, _amount * 10 **18);
    } 

    function mint(address _to, uint256 _amount) external onlyRole(MANAGER) {
        _mint(_to, _amount);
    }

}
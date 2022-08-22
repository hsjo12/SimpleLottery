// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import this file to use console.log

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
contract TicketToken is ERC20Burnable, AccessControl{

    bytes32 constant MANAGER = keccak256(bytes("MANAGER")); 
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE,msg.sender);
        _setupRole(MANAGER,msg.sender);
        _mint(msg.sender, 10 ether);
    } 

    function mint(address _to, uint256 _amount) public onlyRole(MANAGER) {
        _mint(_to, _amount);
    }

}
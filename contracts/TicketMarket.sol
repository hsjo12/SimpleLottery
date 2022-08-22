// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import this file to use console.log

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
interface ITicketToken {
    function mint(address _to, uint256 _amount) external;
}
contract TicketMarket is ReentrancyGuard, AccessControl{
    
    error FailedToSendETH();
    error rateMustBeMoreThan1(uint8 rate);
    bytes32 constant MANAGER = keccak256(bytes("MANAGER")); 
    uint8 public s_rate;
    address immutable public s_ticketTokn;
    address immutable public s_treasury; 
    constructor(address _treasury, address _ticketTokn){
        _setupRole(DEFAULT_ADMIN_ROLE,msg.sender);
        _setupRole(MANAGER,msg.sender);
        s_rate = 2;
        s_treasury = _treasury;
        s_ticketTokn = _ticketTokn;
    }

    function buy() external payable nonReentrant{
        uint256 paidValue = msg.value;
        uint256 tokenToSend = calculate(paidValue);
        ITicketToken(s_ticketTokn).mint(msg.sender,tokenToSend);
        (bool _result,) = s_treasury.call{value:paidValue}(abi.encodeWithSignature("updateTreasury()"));
        if(!_result) revert FailedToSendETH();
    }

    function calculate(uint256 _paidValue) public view returns(uint256) {
        return  _paidValue * s_rate;
    }

    function setRate(uint8 _rate) external onlyRole(MANAGER) {
        if(_rate==0) revert rateMustBeMoreThan1(_rate);
        s_rate = _rate;
    }

    

}
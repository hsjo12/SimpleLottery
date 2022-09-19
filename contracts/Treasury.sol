// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import this file to use console.log

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
contract Treasury is AccessControl{
    error FailedToSendETH();
    error InsufficientRewards(uint256 _currentRewards, uint256 _amount);
    error ClaimRewardsFail();
    bytes32 constant MANAGER = 0xaf290d8680820aad922855f39b306097b20e28774d6c1ad35a20325630c3a02c; 
    bytes32 constant SENDER = 0xcf2b1209506b76f140fb1bc5fe66d6e42627c4b9703a951d65552f50f14c9ee7; 
    uint256 public s_rewardTreasury;
    uint256 public s_adminTreasury;
    uint8 public s_adminRate;

    mapping(uint256=>uint256) public s_roundRewardsHistory;   
    mapping(uint256=>uint256) public s_roundRewardsTracker;
    // round => whichPlace => amount per winner
    mapping(uint256=>uint256) public s_rewardsPerWinner;
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE,msg.sender);
        _setupRole(SENDER,msg.sender);
        _setupRole(MANAGER,msg.sender);
        s_adminRate = 20;
    }

    function updateTreasury() external payable onlyRole(SENDER){
        uint256 _receivedValue = msg.value;
        uint256 newAdmintTreasury =  ((_receivedValue * s_adminRate) / 100);
        s_adminTreasury = s_adminTreasury + newAdmintTreasury;
        _receivedValue = _receivedValue - newAdmintTreasury;
        s_rewardTreasury = s_rewardTreasury + _receivedValue;
    }

    function updateEachUserClaim(
        uint256 _round,
        uint256 _totalWinnerNums
    ) 
        external  
        onlyRole(SENDER) 
    {

        uint256 eachRewards;
        uint256 totalReward;
        uint256 rewardTreasury = s_rewardTreasury;
        mapping(uint256=>uint256) storage rewardsPerWinner = s_rewardsPerWinner;
        mapping(uint256=>uint256) storage roundRewardsTracker = s_roundRewardsTracker;
     
        if(_totalWinnerNums!=0){
            eachRewards = rewardTreasury/_totalWinnerNums;
            totalReward = eachRewards*_totalWinnerNums;
        }   
       
        s_rewardTreasury = rewardTreasury - totalReward;

        
        roundRewardsTracker[_round] = totalReward;
        s_roundRewardsHistory[_round] = totalReward;
        rewardsPerWinner[_round] = eachRewards;

    }

    function setAdminRate(uint8 _rate) external onlyRole(MANAGER) {
       s_adminRate = _rate;
    }
    function withdraw(address _to) external onlyRole(DEFAULT_ADMIN_ROLE) {
        (bool result,) = _to.call{value:s_adminTreasury}("");
        if(!result) revert FailedToSendETH();
    }


    function claimRewards(address _to, uint256 _round) external onlyRole(SENDER)  {
        uint amount = s_rewardsPerWinner[_round];
        uint256 rewardTreasury = s_roundRewardsTracker[_round];    
        s_roundRewardsTracker[_round] = rewardTreasury - amount;
        (bool _result,) = _to.call{value:amount}("");
        if(!_result) revert ClaimRewardsFail();
    }

    function setLotteryBox(address _lotteryBox) external onlyRole(MANAGER) {
        _setupRole(SENDER, _lotteryBox);
    }

    function balanceOfAdminTreasury() external view returns(uint256){
        return s_adminTreasury;
    }
    function balanceOfRewardTreasury() external view returns(uint256){
        return s_rewardTreasury;
    }    
    function balanceOfRewardTreasuryInThePastRound(uint256 _round) external view returns(uint256){
        return  s_roundRewardsHistory[_round];
    }
    
}
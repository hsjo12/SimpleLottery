// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import this file to use console.log

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";

interface IERC20_BURN {
    function burnFrom(address account, uint256 amount) external;
}
interface IVRFv2Consumber  {
  function s_randomWords(uint256) external view returns(uint256); 
} 

interface ITreasury {
   
    function updateEachUserClaim(
        uint256 _round,
        uint256 _totalWinnerNums
    ) external;  

    function claimRewards(address _to, uint256 _round)  external;
}
contract LotteryBox is ReentrancyGuard, AccessControl {
    bytes32 constant MANAGER = 0xaf290d8680820aad922855f39b306097b20e28774d6c1ad35a20325630c3a02c; 
   
    error WrongNumbers(uint256 _pickNumber);
    error NotWinner();
    error ClaimRewardsFail();

    // round => user => user's pick number[]
    mapping(uint256=>mapping(address=>uint256[])) public s_userSelectedNumbers;
    // round => user => user's pick number => bool
    mapping(uint256=>mapping(address=>mapping(uint256=>bool))) public s_isNotClaimed; 
    // round => user's pick number => users[]
    mapping(uint256=>mapping(uint256=>address[])) public s_joinedList; 
  
    mapping(uint256=>uint256) public s_winNumberList;
    mapping(address=>uint256) public s_userRewards;
    mapping(uint256=>uint256[3]) public s_winnerSize;

    uint256 public s_round = 1;
    uint256 public s_ticketgameFee = 0.1 ether; 
    uint256 public s_rewardsTicketgameFee = 1 ether; 
    IVRFv2Consumber immutable public s_VRFv2Consumber;
    IERC20_BURN immutable public s_ticketToken;
    IERC20_BURN immutable public s_rewardsTicketToken;
    ITreasury immutable public s_treasury;


    constructor(address _VRFv2Consumber, address _ticketToken, address _rewardsTicketToken, address _treasury){
        s_VRFv2Consumber = IVRFv2Consumber(_VRFv2Consumber);
        s_ticketToken = IERC20_BURN(_ticketToken);
        s_treasury = ITreasury(_treasury);
        s_rewardsTicketToken=IERC20_BURN(_rewardsTicketToken);
        _setupRole(DEFAULT_ADMIN_ROLE,msg.sender);
        _setupRole(MANAGER,msg.sender);
    }
    function joinGameWithTickets(uint256 _pickNumber) external {
        address currentUser = msg.sender;
        s_ticketToken.burnFrom(currentUser, s_ticketgameFee);
        if(_pickNumber<=100000 && _pickNumber<=999999) revert WrongNumbers(_pickNumber);
        uint256 round = s_round;
        s_joinedList[round][_pickNumber].push(currentUser);
        s_userSelectedNumbers[round][currentUser].push(_pickNumber);
        s_isNotClaimed[round][currentUser][_pickNumber] = true;
    }

    function joinGameWithrewardsTickets(uint256 _pickNumber) external {
        address currentUser = msg.sender;
        s_rewardsTicketToken.burnFrom(currentUser, s_rewardsTicketgameFee);
        if(_pickNumber<=100000 && _pickNumber<=999999) revert WrongNumbers(_pickNumber);
        uint256 round = s_round;
        s_joinedList[round][_pickNumber].push(currentUser);
        s_userSelectedNumbers[round][currentUser].push(_pickNumber);
        s_isNotClaimed[round][currentUser][_pickNumber] = true;
    }
    

    function openResult() external onlyRole(MANAGER) nonReentrant() {
        uint winNumber =s_VRFv2Consumber.s_randomWords(0);
        uint round = s_round;
        s_winNumberList[round] = winNumber;
        uint winnerSize = s_joinedList[round][winNumber].length;
        ITreasury(s_treasury).updateEachUserClaim(round,winnerSize);
        
        s_round = ++round;
    
    }


    function claim(uint256 _round) external nonReentrant() {
        address currentUser = msg.sender;
        mapping(uint256=>mapping(address=>mapping(uint256=>bool))) storage isNotClaimed = s_isNotClaimed; 
        uint256 _winNumber =   s_winNumberList[_round];
        address[] storage joinedList = s_joinedList[_round][_winNumber];
        

        for(uint i = 0; i < joinedList.length; ++i) {
            if(joinedList[i] == currentUser){
                break;
            }
            if(i == joinedList.length-1 && joinedList[i] != currentUser){
                revert NotWinner();
            }
        }
        if(isNotClaimed[_round][currentUser][_winNumber]){
            isNotClaimed[_round][currentUser][_winNumber] = false;
            s_treasury.claimRewards(currentUser,_round);
        }else{
            revert ClaimRewardsFail();
        }
    }

    function getJoinedList(uint256 _round,uint256 _pickNumber) external view returns(address[] memory) {
        return s_joinedList[_round][_pickNumber];
    }
    function getUserSelectedNumbers(uint256 _round,address _user) external view returns(uint256[] memory) {
        return s_userSelectedNumbers[_round][_user];
    }

    function getIsNotClaimed(uint256 _round,address _user,uint256 _pickNumber) external view returns(bool) {
        return s_isNotClaimed[_round][_user][_pickNumber];
    }
    function setGameFeeWithTickets(uint256 _gameFee) external onlyRole(MANAGER) {
        s_ticketgameFee = _gameFee;
    }
    function setGameFeeWithrewardsTickets(uint256 _gameFee) external onlyRole(MANAGER) {
        s_rewardsTicketgameFee = _gameFee;
    }

}

/*

    //To add this soon
    function findHowManyNumbersMatched(string memory _input, string memory _targetNum) public pure returns(uint){
        bytes memory inputInBytes = bytes(_input);
        bytes memory targetNumInBytes = bytes(_targetNum);
        uint correct;
        for(uint i; i < inputInBytes.length; i++){
            if(inputInBytes[i]==targetNumInBytes[i]){
                correct++;
            }
        }
        return correct;
    } 

*/ 
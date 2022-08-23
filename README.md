# SimpleLottery

There are 7 smart contracts as follows;

1. TicketToken.sol (ERC20)
2. TicketMarket.sol
3. Treasury.sol
4. LotteryBox.sol
5. VRFv2Consumer.sol
6. StakeBox.sol
7. RewardTicket.sol (ERC20) 

Senario 1 : a user play a lotter game with ticket tokens

1. User can buy Ticket tokens with Ether from TicketMarket.sol.
2. Once a user gianed ticket tokens, the TicketMarket.sol send Treasury.sol Ether user sent.
3. Once the Treasury.sol received Ether from the TicketMarket.sol, the Treasury.sol will split the received ether in two; One for lottery rewards and One for admin.
4. a user can join a game throught the LotteryBox.sol by spending Ticket Tokens.
5. Everey 3 am, the chainlink keeper excutes the request the requestRandomWords function in the VRFv2Consumer.sol and executes the openResult function in LotteryBox.sol.

the requestRandomWords function in the VRFv2Consumer : To generate random numbers which is lottery winning numbers
the openResult function in LotteryBox.sol : To announce the winning numbers and move to the next round


Senario 2 : a user play a lotter game with rewards tokens

1. A user can stake his.her ticket toknes via the StakeBox.sol to get rewards ticket.
2. After user claimed rewards ticket tokens, a user can join a game throught the LotteryBox.sol by spending Ticket Tokens.
3. Everey 3 am, the chainlink keeper excutes the request the requestRandomWords function in the VRFv2Consumer.sol and executes the openResult function in LotteryBox.sol.

*******************************************************************************************************************************************************************
Process 

Straighforwardly, You can visit "https://6303284a2a41dd2d7edb1c4e-funny-boba.netlify.app/"

1. 
git clone https://github.com/hsjo12/SimpleLottery.git
 
2.
npm i 

3. 
cd frontend

4.
npm i

5. 
npm run dev
**********************************************************************************************************************************************************************
Test

1. ticketTokens.sol, TicektMarket.sol
npx hardhat test ./test/ticketTokens_TicektMarket.js

2.rewardTicektToken.sol, StakeBox.sol
npx hardhat test ./test/rewardTicektToken_StakeBox.js

3. lotteryBox.sol
To be completed soon.
**********************************************************************************************************************************************************************



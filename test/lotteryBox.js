const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("stakedTicektToken_StakeBox", () => {
  const VRFv2ConsumerAddress = "0x1867491B550420A8C863a66242C1f7aa4A4997fD";
  let treasury, ticketToken, rewardTicketToken, stakeBox, owner, manager, user1;
  const rewardTicketTokenName = "Rticket";
  const rewardTicketTokenSymbol = "RTK";
  const ticketTokenName = "Ticket";
  const ticketTokenSymbol = "TK";
  const MANAGER = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MANAGER"));
  const SENDER = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SENDER"));
  const OneETH = ethers.utils.parseEther("1");
  const TenETH = ethers.utils.parseEther("10");
  const MAXETH = ethers.constants.MaxUint256;
  const tillRewards = Math.floor(new Date(2022, 07, 30).getTime() / 1000);
  beforeEach(async () => {
    [owner, manager, user1] = await ethers.getSigners();

    const Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy();
    await treasury.deployed();

    const TicketToken = await ethers.getContractFactory("TicketToken");
    ticketToken = await TicketToken.deploy(ticketTokenName, ticketTokenSymbol);
    await ticketToken.deployed();

    const RewardTicketToken = await ethers.getContractFactory(
      "RewardTicketToken"
    );
    rewardTicketToken = await RewardTicketToken.deploy(
      rewardTicketTokenName,
      rewardTicketTokenSymbol
    );
    await rewardTicketToken.deployed();

    const StakeBox = await ethers.getContractFactory("StakeBox");
    stakeBox = await StakeBox.deploy(
      ticketToken.address,
      rewardTicketToken.address
    );
    stakeBox.deployed();

    const LotteryBox = await ethers.getContractFactory("LotteryBox");
    const lotteryBox = await LotteryBox.deploy(
      VRFv2ConsumerAddress,
      ticketToken.address,
      rewardTicketToken.address,
      treasury.address
    );
    await lotteryBox.deployed();

    await treasury.grantRole(SENDER, lotteryBox.address);
    await ticketToken.grantRole(MANAGER, manager.address);
    await stakeBox.grantRole(MANAGER, manager.address);
    await rewardTicketToken.grantRole(MANAGER, manager.address);
  });

  describe("LotteryBox", () => {});
});

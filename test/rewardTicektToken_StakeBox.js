const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("stakedTicektToken_StakeBox", () => {
  let ticketToken, rewardTicketToken, stakeBox, owner, manager, user1;
  const rewardTicketTokenName = "Rticket";
  const rewardTicketTokenSymbol = "RTK";
  const ticketTokenName = "Ticket";
  const ticketTokenSymbol = "TK";
  const MANAGER = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MANAGER"));
  const SENDER = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SENDER"));
  const ZeroETH = ethers.utils.parseEther("0");
  const OneETH = ethers.utils.parseEther("1");
  const TenETH = ethers.utils.parseEther("10");
  const MAXETH = ethers.constants.MaxUint256;
  const tillRewards = Math.floor(new Date(2022, 07, 30).getTime() / 1000);

  beforeEach(async () => {
    [owner, manager, user1] = await ethers.getSigners();
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

    await ticketToken.grantRole(MANAGER, manager.address);
    await stakeBox.grantRole(MANAGER, manager.address);
    await rewardTicketToken.grantRole(MANAGER, manager.address);
  });

  describe("RewardTicketToken", () => {
    it("RewardTicketToken is successfully deployed", async () => {
      await expect(rewardTicketToken.address).to.not.eq(0x0);
      await expect(await rewardTicketToken.name()).to.eq(rewardTicketTokenName);
      await expect(await rewardTicketToken.symbol()).to.eq(
        rewardTicketTokenSymbol
      );
    });

    it("Only the role 'MANAGER' can mint rewardTicketToken", async () => {
      await rewardTicketToken.connect(manager).mint(manager.address, OneETH);
      expect(await rewardTicketToken.balanceOf(manager.address)).to.eq(OneETH);
    });

    it("Other roles except 'MANAGER' cannot rewardTicketToken", async () => {
      const lowerCaseAddress = user1.address.toString().toLowerCase();
      await expect(
        rewardTicketToken.connect(user1).mint(user1.address, OneETH)
      ).to.be.revertedWith(
        `AccessControl: account ${lowerCaseAddress} is missing role ${MANAGER}`
      );
    });
  });

  describe("StakeBox", () => {
    it("StakeBox is successfully deployed", async () => {
      await expect(stakeBox.address).to.not.eq(0x0);
    });

    it("Only the role Manager can set up setRewardsDuration", async () => {
      await stakeBox.connect(manager).setRewardsDuration(tillRewards);
      await expect(await stakeBox.connect(manager).duration()).to.eq(
        tillRewards
      );
    });

    it("other roles except 'Manager' cannot set up setRewardsDuration", async () => {
      await expect(stakeBox.connect(user1).setRewardsDuration(tillRewards)).to
        .be.rejected;
    });

    it("Only the role Manager can set up notifyRewardAmount", async () => {
      await stakeBox.connect(manager).setRewardsDuration(tillRewards);
      await rewardTicketToken.connect(manager).mint(manager.address, TenETH);
      await rewardTicketToken
        .connect(manager)
        .approve(stakeBox.address, MAXETH);
      await stakeBox.connect(manager).notifyRewardAmount(TenETH);
      await expect(await rewardTicketToken.balanceOf(stakeBox.address)).to.eq(
        TenETH
      );
    });

    it("other roles except 'Manager' cannot set up setRewardsDuration", async () => {
      await expect(stakeBox.connect(user1).setRewardsDuration(tillRewards)).to
        .be.rejected;
    });

    it("User1 can stake ticket tokens", async () => {
      await ticketToken.connect(manager).mint(user1.address, OneETH);

      const balanceOfUser1 = await ticketToken.balanceOf(user1.address);
      await ticketToken.connect(user1).approve(stakeBox.address, MAXETH);
      await stakeBox.connect(user1).stake(balanceOfUser1);
      const currentTicketTokenBalanceOfUser1 = await ticketToken.balanceOf(
        user1.address
      );
      await expect(await stakeBox.balanceOf(user1.address)).to.eq(OneETH);
      await expect(currentTicketTokenBalanceOfUser1).to.eq(ZeroETH);
    });

    it("User1 cannot stake the exceeded amount of ticket tokens", async () => {
      await ticketToken.connect(manager).mint(user1.address, OneETH);
      await ticketToken.connect(user1).approve(stakeBox.address, MAXETH);
      await expect(stakeBox.connect(user1).stake(TenETH)).to.be.rejected;
    });

    it("After staking ticket tokens, user1 can earn some rewards", async () => {
      await rewardTicketToken.connect(manager).mint(manager.address, TenETH);
      await rewardTicketToken
        .connect(manager)
        .approve(stakeBox.address, MAXETH);
      await stakeBox.connect(manager).setRewardsDuration(tillRewards);
      await stakeBox.connect(manager).notifyRewardAmount(TenETH);
      await ticketToken.connect(manager).mint(user1.address, OneETH);
      await ticketToken.connect(user1).approve(stakeBox.address, MAXETH);
      await stakeBox.connect(user1).stake(OneETH);

      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      await expect(await stakeBox.earned(user1.address)).to.not.eq(ZeroETH);
    });

    it("After staking ticket tokens, user1 can claim rewards", async () => {
      await rewardTicketToken.connect(manager).mint(manager.address, TenETH);
      await rewardTicketToken
        .connect(manager)
        .approve(stakeBox.address, MAXETH);
      await stakeBox.connect(manager).setRewardsDuration(tillRewards);
      await stakeBox.connect(manager).notifyRewardAmount(TenETH);
      await ticketToken.connect(manager).mint(user1.address, OneETH);
      await ticketToken.connect(user1).approve(stakeBox.address, MAXETH);
      await stakeBox.connect(user1).stake(OneETH);

      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");
      await stakeBox.connect(user1).getReward();
      await expect(await rewardTicketToken.balanceOf(user1.address)).to.not.eq(
        ZeroETH
      );
    });

    it("After staking ticket tokens, user1 can withdraw staked ticket tokens and earn some rewards", async () => {
      await rewardTicketToken.connect(manager).mint(manager.address, TenETH);
      await rewardTicketToken
        .connect(manager)
        .approve(stakeBox.address, MAXETH);
      await stakeBox.connect(manager).setRewardsDuration(tillRewards);
      await stakeBox.connect(manager).notifyRewardAmount(TenETH);
      await ticketToken.connect(manager).mint(user1.address, OneETH);
      await ticketToken.connect(user1).approve(stakeBox.address, MAXETH);
      await stakeBox.connect(user1).stake(OneETH);

      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");
      await stakeBox.connect(user1).withdraw(OneETH);

      await expect(await ticketToken.balanceOf(user1.address)).to.eq(OneETH);
      await expect(await rewardTicketToken.balanceOf(user1.address)).to.not.eq(
        ZeroETH
      );
    });
  });
});

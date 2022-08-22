const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TicketTokens&TicektMarket", () => {
  let ticketToken, treasury, ticketMarket, owner, manager, user1;
  const ticketTokenName = "Ticket";
  const ticketTokenSymbol = "TK";
  const MANAGER = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MANAGER"));
  const SENDER = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SENDER"));

  const OneETH = ethers.utils.parseEther("1");
  beforeEach(async () => {
    [owner, manager, user1] = await ethers.getSigners();
    const TicketToken = await ethers.getContractFactory("TicketToken");
    ticketToken = await TicketToken.deploy(ticketTokenName, ticketTokenSymbol);
    await ticketToken.deployed();

    const Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy();
    await treasury.deployed();

    const TicketMarket = await ethers.getContractFactory("TicketMarket");
    ticketMarket = await TicketMarket.deploy(
      treasury.address,
      ticketToken.address
    );

    await ticketToken.grantRole(MANAGER, ticketMarket.address);
    await treasury.grantRole(SENDER, ticketMarket.address);
  });
  describe("TicketToken", () => {
    it("TicketToken is successfully deployed", async () => {
      expect(ticketToken.address).to.not.eq(0x0);
      expect(await ticketToken.name()).to.eq(ticketTokenName);
      expect(await ticketToken.symbol()).to.eq(ticketTokenSymbol);
    });

    it("Only the role 'MANAGER' can mint ticket tokens", async () => {
      await ticketToken.grantRole(MANAGER, manager.address);

      await ticketToken.connect(manager).mint(manager.address, OneETH);
      expect(await ticketToken.balanceOf(manager.address)).to.eq(OneETH);
    });

    it("Other roles except 'MANAGER' cannot mint ticket tokens", async () => {
      const lowerCaseAddress = user1.address.toString().toLowerCase();
      await expect(
        ticketToken.connect(user1).mint(user1.address, OneETH)
      ).to.be.revertedWith(
        `AccessControl: account ${lowerCaseAddress} is missing role ${MANAGER}`
      );
    });
  });

  describe("TicketMarket", () => {
    it("should be deployed successfully", async () => {
      expect(ticketMarket.address).to.not.eq(0x0);
    });

    it("Only the role 'MANAGER'  can execute setRate", async () => {
      const FakeRate = 2;
      await ticketMarket.grantRole(MANAGER, manager.address);
      await ticketMarket.connect(manager).setRate(FakeRate);
      expect(await ticketMarket.s_rate()).to.eq(FakeRate);
    });
    it("Other roles except 'MANAGER' cannot execute setRate", async () => {
      const FakeRate = 0;
      const lowerCaseAddress = user1.address.toString().toLowerCase();
      await ticketMarket.grantRole(MANAGER, manager.address);

      await expect(
        ticketMarket.connect(manager).setRate(FakeRate)
      ).to.be.revertedWith(
        `AccessControl: account ${lowerCaseAddress} is missing role ${MANAGER}`
      );
    });
    it("User can buy 2 ticket tokens with 1 ether by excuting the buy funtion", async () => {
      const totalReceivedTickets = 2;
      const balanceOfUser1 = await user1.getBalance();
      await ticketMarket.connect(user1).buy({ value: OneETH });
      const currentBalanceOfUser1 = await user1.getBalance();
      const ticektTokenBalanceOfUser1 = await ticketToken.balanceOf(
        user1.address
      );
      expect(currentBalanceOfUser1).to.be.below(balanceOfUser1.sub(OneETH));
      expect(ticektTokenBalanceOfUser1).to.eq(
        ethers.utils.parseEther(totalReceivedTickets.toString())
      );
    });
    it("After the purchase of ticket tokens, ethers will be split into adminTreasury at 20% and rewardTreasury at 80% in treasury.sol", async () => {
      await ticketMarket.connect(user1).buy({ value: OneETH });
      const rewardTreasury = await treasury.s_rewardTreasury();
      const adminTreasury = await treasury.s_adminTreasury();

      expect(Number(rewardTreasury.toString())).to.eq(
        Number(OneETH.toString()) * 0.8
      );

      expect(Number(adminTreasury.toString())).to.eq(
        Number(OneETH.toString()) * 0.2
      );
    });

    it("The role 'MANAGER' cannot set up the rate is 1", async () => {
      const rate = 0;
      await expect(ticketMarket.connect(manager).setRate(rate)).to.be.rejected;
    });
    it("After the rate is 3, User can buy 3 ticket tokens with 1 ether by excuting the buy funtion ", async () => {
      await ticketMarket.grantRole(MANAGER, manager.address);
      const rate = 3;
      const totalReceivedTickets = 3;
      await ticketMarket.connect(manager).setRate(rate);
      const balanceOfUser1 = await user1.getBalance();
      await ticketMarket.connect(user1).buy({ value: OneETH });
      const currentBalanceOfUser1 = await user1.getBalance();
      const ticektTokenBalanceOfUser1 = await ticketToken.balanceOf(
        user1.address
      );
      expect(currentBalanceOfUser1).to.be.below(balanceOfUser1.sub(OneETH));
      expect(ticektTokenBalanceOfUser1).to.eq(
        ethers.utils.parseEther(totalReceivedTickets.toString())
      );
    });
  });
});

// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const VRFv2ConsumerAddress = "0x1867491B550420A8C863a66242C1f7aa4A4997fD";
  const ticketTokenName = "Ticket";
  const ticketTokenSymbol = "TK";
  const rewardTicketTokenName = "Rticket";
  const rewardTicketTokenSymbol = "RTK";
  const MANAGER = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MANAGER"));
  const SENDER = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SENDER"));
  const [owner, manager] = await hre.ethers.getSigners();

  const VRFv2Consumer = await hre.ethers.getContractFactory("VRFv2Consumer");
  const vRFv2Consumer = await VRFv2Consumer.attach(VRFv2ConsumerAddress);

  const Treasury = await hre.ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.deployed();

  console.log(`treasury DEPLOY : ${treasury.address}`);

  const TicketToken = await hre.ethers.getContractFactory("TicketToken");
  const ticketToken = await TicketToken.deploy(
    ticketTokenName,
    ticketTokenSymbol
  );
  await ticketToken.deployed();

  console.log(`ticketToken DEPLOY : ${ticketToken.address}`);

  const TicketMarket = await hre.ethers.getContractFactory("TicketMarket");
  const ticketMarket = await TicketMarket.deploy(
    treasury.address,
    ticketToken.address
  );
  await ticketMarket.deployed();

  console.log(`ticketMarket DEPLOY : ${ticketMarket.address}`);

  const RewardTicketToken = await hre.ethers.getContractFactory(
    "RewardTicketToken"
  );
  const rewardTicketToken = await RewardTicketToken.deploy(
    rewardTicketTokenName,
    rewardTicketTokenSymbol
  );
  await rewardTicketToken.deployed();

  console.log(`rewardTicketToken DEPLOY : ${rewardTicketToken.address}`);

  const StakeBox = await hre.ethers.getContractFactory("StakeBox");
  const stakeBox = await StakeBox.deploy(
    ticketToken.address,
    rewardTicketToken.address
  );
  await stakeBox.deployed();

  console.log(`stakeBox DEPLOY : ${stakeBox.address}`);

  const LotteryBox = await hre.ethers.getContractFactory("LotteryBox");
  const lotteryBox = await LotteryBox.deploy(
    VRFv2ConsumerAddress,
    ticketToken.address,
    rewardTicketToken.address,
    treasury.address
  );
  await lotteryBox.deployed();

  console.log(`lotteryBox DEPLOY : ${lotteryBox.address}`);
  const chainId = hre.network.config.chainId;
  createJS(vRFv2Consumer, "VRFv2Consumer", chainId);
  createJS(treasury, "Treasury", chainId);
  createJS(ticketToken, "TicketToken", chainId);
  createJS(rewardTicketToken, "RewardTicketToken", chainId);
  createJS(ticketMarket, "TicketMarket", chainId);
  createJS(stakeBox, "StakeBox", chainId);
  createJS(lotteryBox, "LotteryBox", chainId);

  const tx = await vRFv2Consumer.grantRole(MANAGER, lotteryBox.address);
  await tx.wait();
  const tx1 = await treasury.grantRole(SENDER, lotteryBox.address);
  await tx1.wait();
  const tx2 = await treasury.grantRole(SENDER, ticketMarket.address);
  await tx2.wait();
  const tx3 = await treasury.grantRole(MANAGER, manager.address);
  await tx3.wait();

  const tx4 = await ticketToken.grantRole(MANAGER, ticketMarket.address);
  await tx4.wait();
  const tx5 = await ticketToken.grantRole(MANAGER, manager.address);
  await tx5.wait();

  const tx6 = await rewardTicketToken.grantRole(MANAGER, stakeBox.address);
  await tx6.wait();
  const tx7 = await rewardTicketToken.grantRole(MANAGER, manager.address);
  await tx7.wait();

  const tx8 = await stakeBox.grantRole(MANAGER, manager.address);
  await tx8.wait();
  const tx9 = await ticketMarket.grantRole(MANAGER, manager.address);
  await tx9.wait();
  const tx10 = await lotteryBox.grantRole(MANAGER, manager.address);
  await tx10.wait();
}

const createJS = (contract, text, chainId) => {
  const fs = require("fs");
  const path = require("path");
  const addressDir = path.join(__dirname, "../frontend/artifacts/address");
  const abiDir = path.join(__dirname, "../frontend/artifacts/abis");
  if (!fs.existsSync(addressDir)) {
    fs.mkdirSync(addressDir, { recursive: true });
  }
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  fs.writeFileSync(
    addressDir + `/${text}Address.json`,
    JSON.stringify({ chainId, address: contract.address }, undefined, 2)
  );
  const artifacts = hre.artifacts.readArtifactSync(`${text}`);

  fs.writeFileSync(
    abiDir + `/${text}.json`,
    JSON.stringify(artifacts, null, 2)
  );
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

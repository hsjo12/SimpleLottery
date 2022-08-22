import { MsgError, MsgInfo, MsgSuccess } from "../utils/utils";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { ethers } from "ethers";
import LotteryBoxAddress from "../../artifacts/address/LotteryBoxAddress.json";
import TicketTokenAddress from "../../artifacts/address/TicketTokenAddress.json";
import RewardTicketTokenAddress from "../../artifacts/address/RewardTicketTokenAddress.json";
const Buy = ({
  lotteryBoxInstance,
  ticektInstance,
  rewardTicketInstance,
  ticketMarketInstance,
  showBuyPopUp,
  setShowBuyPopUp,
  currentUser,
  treasuryInstance,
  setBalanceOfTreasury,
  ticketfee,
  rewardsTicketfee,
}) => {
  const MAX = ethers.constants.MaxUint256;
  const [expectedTKT, setExpectedTKT] = useState("0");
  const [ethInputValue, setEthInputValue] = useState("0");
  const [selectedNumbers, setSelectedNumbers] = useState("000000");
  const [tktBalance, setTktBalance] = useState("0");
  const [rktBalance, setRktBalance] = useState("0");
  useEffect(() => {
    if (currentUser && ticektInstance && rewardTicketInstance) {
      getBalance();
    }
  }, [currentUser, ticektInstance, rewardTicketInstance, showBuyPopUp]);

  const getBalance = useCallback(async () => {
    let tktBalance = await ticektInstance.balanceOf(currentUser);
    let rktBalance = await rewardTicketInstance.balanceOf(currentUser);

    tktBalance = ethers.utils.formatEther(tktBalance.toString());
    rktBalance = ethers.utils.formatEther(rktBalance.toString());
    setTktBalance(tktBalance);
    setRktBalance(rktBalance);
  }, [currentUser, ticektInstance, rewardTicketInstance]);

  const calculateTKT = useCallback(
    async (e) => {
      let inputEth = ethers.utils.parseEther(e.target.value.toString());
      inputEth = inputEth.toString();
      setEthInputValue(e.target.value);
      let convertedAmount = await ticketMarketInstance.calculate(inputEth);
      convertedAmount = ethers.utils.formatEther(convertedAmount.toString());
      setExpectedTKT(convertedAmount);
    },
    [ticketMarketInstance]
  );

  const buyTKT = useCallback(async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://eth-goerli.g.alchemy.com/v2/mtjnHtG0-z-rtx5zAtMMVq19a0tdo5N_"
    );
    const userBalance = await provider.getBalance(currentUser);
    let inputEth = ethers.utils.parseEther(ethInputValue.toString());

    if (!userBalance.gte(inputEth)) return MsgError("Please have enough ETH");

    let tx = await ticketMarketInstance.buy({
      value: inputEth,
    });
    MsgInfo("Please wait....");
    await tx.wait();
    let lotteryRewards = await treasuryInstance.s_rewardTreasury();
    lotteryRewards = lotteryRewards.toString();

    setBalanceOfTreasury(ethers.utils.formatEther(lotteryRewards).toString());
    await setExpectedTKT("0");
    await setEthInputValue("0");
    await getBalance();
    return await MsgSuccess("Successfully, Purchased");
  }, [ethInputValue, treasuryInstance, setBalanceOfTreasury]);

  const changeNumbers = useCallback((e) => {
    if (e.target.value.length > 6) {
      return MsgError("Please input not more than 6 numbers");
    }
    setSelectedNumbers(e.target.value);
  }, []);

  const getRandom = useCallback(() => {
    let random = "0";
    while (random.toString().length !== 6) {
      random = Math.floor(Math.random() * (999999 - 100000));
    }

    setSelectedNumbers(random.toString());
  }, []);

  const buyWithTKT = useCallback(async () => {
    if (tktBalance < ticketfee) {
      return MsgError("You do not have enough TKT");
    }
    const tktAllowance = await ticektInstance.allowance(
      currentUser,
      LotteryBoxAddress.address
    );
    if (tktAllowance.toString() !== MAX.toString()) {
      const tx = await ticektInstance.approve(LotteryBoxAddress.address, MAX);
      MsgInfo("Please wait....");
      await tx.wait();
    }

    const tx = await lotteryBoxInstance.joinGameWithTickets(selectedNumbers);
    MsgInfo("Please wait....");
    await tx.wait();
    await getBalance();
    return await MsgSuccess("Joined the game!");
  }, [ticektInstance, selectedNumbers, tktBalance, ticketfee]);

  const buyWithRKT = useCallback(async () => {
    if (rktBalance < rewardsTicketfee) {
      return MsgError("You do not have enough RKT");
    }
    const rktAllowance = await rewardTicketInstance.allowance(
      currentUser,
      LotteryBoxAddress.address
    );

    if (rktAllowance.toString() !== MAX.toString()) {
      const tx = await rewardTicketInstance.approve(
        LotteryBoxAddress.address,
        MAX
      );
      MsgInfo("Please wait....");
      await tx.wait();
    }
    const tx = await lotteryBoxInstance.joinGameWithrewardsTickets(
      selectedNumbers
    );
    MsgInfo("Please wait....");
    await tx.wait();
    await getBalance();
    return await MsgSuccess("Joined the game!");
  }, [rewardTicketInstance, selectedNumbers, rewardsTicketfee, rktBalance]);

  const close = useCallback(() => {
    setShowBuyPopUp(false);
    setSelectedNumbers("000000");
  }, []);
  return (
    <Wrapper show={showBuyPopUp}>
      <SubTitle marginSize={"0.8rem"} size={"3rem"}>
        Current Balance
      </SubTitle>
      <SubTitle marginSize={"0.8rem"} size={"2rem"}>
        {tktBalance} TKT
      </SubTitle>
      <SubTitle marginSize={"0.8rem"} size={"2rem"}>
        {rktBalance} RKT
      </SubTitle>
      <SubTitle marginSize={"1rem"} size={"3rem"}>
        Get {expectedTKT} TKT
      </SubTitle>
      <Input
        type="number"
        min="0"
        onChange={calculateTKT}
        value={ethInputValue}
        placeholder="Input Eth"
      />
      <BtnBox>
        <Btn onClick={buyTKT}>Buy TKT With ETH</Btn>
      </BtnBox>

      <SubTitle marginSize={"0.8rem"} size={"3rem"}>
        Selected Number
      </SubTitle>
      <SubTitle marginSize={"0.8rem"} size={"3rem"}>
        {selectedNumbers}
      </SubTitle>
      <Input
        onChange={changeNumbers}
        value={selectedNumbers}
        placeholder="Input your numbers"
      />
      <BtnBox>
        <Btn onClick={getRandom}>Generate Random</Btn>
        <Btn onClick={buyWithTKT}>Play with {ticketfee} TKT</Btn>
        <Btn onClick={buyWithRKT}>Play with {rewardsTicketfee} RKT</Btn>
        <Btn onClick={close}>Close</Btn>
      </BtnBox>
    </Wrapper>
  );
};
const Wrapper = styled.div`
  display: ${(props) => (props.show ? "flex" : "none")};
  position: fixed;

  top: 0;
  left: 0;
  width: 100vw;
  min-height: 100vh;
  overflow: auto;
  background-color: rgba(14, 14, 14, 0.85);
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Input = styled.input`
  border-color: white;
  width: 70%;
  background-color: #202225;
  border: 2px solid rgb(76, 80, 92);
  color: rgb(255, 255, 255);
  cursor: text;
  height: 2rem;
  border-radius: 10px;
  font-size: 1.5rem;
  position: relative;
  outline: none;
`;

const SubTitle = styled.div`
  width: 100%;
  text-align: center;
  font-size: ${(props) => props.size};
  font-family: ${(props) => props.theme.fonts.normal};
  letter-spacing: 10px;
  margin: ${(props) => props.marginSize} 0;
`;

const BtnBox = styled.div`
  display: flex;
  margin 0 auto;
   margin: 1rem 0;
flex-direction: column;
`;
const Btn = styled.div`
  display: flex;
  margin: 0.5rem 0;
  font-size: ${(props) => props.theme.fontSizes.medium};
  cursor: pointer;
  border: 1px solid white;
  padding: 1rem 2rem;
  justify-content: center;
  &:hover {
    text-shadow: ${(props) => props.theme.shadow.textShadow};
    box-shadow: ${(props) => props.theme.shadow.lightShadow};
  }
`;
export default Buy;

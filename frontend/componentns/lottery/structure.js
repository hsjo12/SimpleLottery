import Titles from "./titles";
import Buy from "./buy";
import { SetUpContract } from "../utils/utils";
import { useCallback, useEffect, useContext, useState } from "react";
import { ContextApI } from "../../contextAPI/lotteryContext";
import LotteryBoxAddress from "../../artifacts/address/LotteryBoxAddress.json";
import LotteryBoxAbi from "../../artifacts/abis/LotteryBox.json";
import TicketTokenAddress from "../../artifacts/address/TicketTokenAddress.json";
import TicketTokenAbi from "../../artifacts/abis/TicketToken.json";
import RewardTicketTokenAddress from "../../artifacts/address/RewardTicketTokenAddress.json";
import RewardTicketTokenAbi from "../../artifacts/abis/RewardTicketToken.json";
import TicketMarketAddress from "../../artifacts/address/TicketMarketAddress.json";
import TicketMarketAbi from "../../artifacts/abis/TicketMarket.json";
import TreasuryAddress from "../../artifacts/address/TreasuryAddress.json";
import TreasuryAbi from "../../artifacts/abis/Treasury.json";
import styled from "styled-components";
import { ethers } from "ethers";
import Claim from "./claim";
const Structure = ({
  lotteryRewards,
  round,
  ticketfee,
  rewardsTicketfee,
  lastRoundWinNumber,
}) => {
  const {
    currentUser,
    showBuyPopUp,
    setShowBuyPopUp,
    setBalanceOfTreasury,
    balanceOfTreasury,
    showClaimPopUp,
    setShowClaimPopUp,
  } = useContext(ContextApI);
  useEffect(() => {
    setBalanceOfTreasury(ethers.utils.formatEther(lotteryRewards).toString());
  }, []);
  useEffect(() => {
    if (currentUser) setUp();
  }, [currentUser]);
  const [lotteryBoxInstance, setLotteryBoxInstance] = useState(null);
  const [ticektInstance, setTicketInstance] = useState(null);
  const [rewardTicketInstance, setRewardTicketInstance] = useState(null);
  const [ticketMarketInstance, setTicketMarketInstance] = useState(null);
  const [treasuryInstance, setTreasuryInstance] = useState(null);
  const setUp = useCallback(async () => {
    const lotteryBox = await SetUpContract(
      LotteryBoxAddress.address,
      LotteryBoxAbi.abi
    );
    const ticekt = await SetUpContract(
      TicketTokenAddress.address,
      TicketTokenAbi.abi
    );
    const rewardTicket = await SetUpContract(
      RewardTicketTokenAddress.address,
      RewardTicketTokenAbi.abi
    );
    const ticketMarket = await SetUpContract(
      TicketMarketAddress.address,
      TicketMarketAbi.abi
    );
    const treasury = await SetUpContract(
      TreasuryAddress.address,
      TreasuryAbi.abi
    );
    setLotteryBoxInstance(lotteryBox);
    setTicketInstance(ticekt);
    setRewardTicketInstance(rewardTicket);
    setTicketMarketInstance(ticketMarket);
    setTreasuryInstance(treasury);
  }, [currentUser]);

  return (
    <Wrapper>
      <Titles
        balanceOfTreasury={balanceOfTreasury}
        round={round}
        ticketfee={ticketfee}
        rewardsTicketfee={rewardsTicketfee}
        lastRoundWinNumber={lastRoundWinNumber}
        setShowBuyPopUp={setShowBuyPopUp}
        currentUser={currentUser}
        setShowClaimPopUp={setShowClaimPopUp}
      />
      <Buy
        lotteryBoxInstance={lotteryBoxInstance}
        ticektInstance={ticektInstance}
        rewardTicketInstance={rewardTicketInstance}
        ticketMarketInstance={ticketMarketInstance}
        showBuyPopUp={showBuyPopUp}
        setShowBuyPopUp={setShowBuyPopUp}
        currentUser={currentUser}
        setBalanceOfTreasury={setBalanceOfTreasury}
        treasuryInstance={treasuryInstance}
        ticketfee={ethers.utils.formatEther(ticketfee.toString())}
        rewardsTicketfee={ethers.utils.formatEther(rewardsTicketfee.toString())}
      />
      <Claim
        treasuryInstance={treasuryInstance}
        lotteryBoxInstance={lotteryBoxInstance}
        currentUser={currentUser}
        showClaimPopUp={showClaimPopUp}
        setShowClaimPopUp={setShowClaimPopUp}
        round={round}
      />
    </Wrapper>
  );
};

export default Structure;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  padding: 1rem 0;
`;

import { SetUpContractForOnlyRead } from "../componentns/utils/utils";
import Structure from "../componentns/lottery/structure";
import LotteryBoxAddress from "../artifacts/address/LotteryBoxAddress.json";
import LotteryBoxAbi from "../artifacts/abis/LotteryBox.json";
import TreasuryAddress from "../artifacts/address/TreasuryAddress.json";
import TreasuryAbi from "../artifacts/abis/Treasury.json";
const index = ({
  lotteryRewards,
  round,
  ticketfee,
  rewardsTicketfee,
  lastRoundWinNumber,
}) => {
  return (
    <Structure
      lotteryRewards={lotteryRewards}
      round={round}
      ticketfee={ticketfee}
      rewardsTicketfee={rewardsTicketfee}
      lastRoundWinNumber={lastRoundWinNumber}
    />
  );
};

export default index;
export async function getServerSideProps(context) {
  const treasuryInstance = await SetUpContractForOnlyRead(
    TreasuryAddress.address,
    TreasuryAbi.abi
  );
  const lotteryBoxInstance = await SetUpContractForOnlyRead(
    LotteryBoxAddress.address,
    LotteryBoxAbi.abi
  );
  let lotteryRewards = await treasuryInstance.s_rewardTreasury();
  lotteryRewards = lotteryRewards.toString();
  let round = await lotteryBoxInstance.s_round();
  round = round.toString();
  let ticketfee = await lotteryBoxInstance.s_ticketgameFee();
  ticketfee = ticketfee.toString();
  let rewardsTicketfee = await lotteryBoxInstance.s_rewardsTicketgameFee();
  rewardsTicketfee = rewardsTicketfee.toString();
  let lastRoundWinNumber = await lotteryBoxInstance.s_winNumberList(
    Number(round) - 1
  );
  lastRoundWinNumber = lastRoundWinNumber.toString();

  return {
    props: {
      lotteryRewards,
      round,
      ticketfee,
      rewardsTicketfee,
      lastRoundWinNumber,
    },
  };
}

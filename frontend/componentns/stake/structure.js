import StakeAddress from "../../artifacts/address/StakeBoxAddress.json";
import StakeAbi from "../../artifacts/abis/StakeBox.json";
import TicketTokenAddress from "../../artifacts/address/TicketTokenAddress.json";
import TicketTokenAbi from "../../artifacts/abis/TicketToken.json";
import styled from "styled-components";
import { useCallback, useEffect, useContext, useState } from "react";
import { ContextApI } from "../../contextAPI/lotteryContext";
import { SetUpContract } from "../utils/utils";
import Stake from "./stake";
const Structure = () => {
  const { currentUser } = useContext(ContextApI);
  const [stakeInstance, setStakeInstance] = useState(null);
  const [ticektInstance, setTicketInstance] = useState(null);
  useEffect(() => {
    if (currentUser) setUp();
  }, [currentUser]);

  const setUp = useCallback(async () => {
    const stake = await SetUpContract(StakeAddress.address, StakeAbi.abi);
    setStakeInstance(stake);
    const ticekt = await SetUpContract(
      TicketTokenAddress.address,
      TicketTokenAbi.abi
    );
    setTicketInstance(ticekt);
  }, [currentUser, StakeAddress, StakeAbi]);

  return (
    <Wrapper>
      <Stake
        ticektInstance={ticektInstance}
        stakeInstance={stakeInstance}
        currentUser={currentUser}
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

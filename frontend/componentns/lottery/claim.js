import { useCallback, useState } from "react";
import styled from "styled-components";
import { ethers } from "ethers";
import { MsgError, MsgInfo, MsgSuccess } from "../utils/utils";
const Claim = ({
  treasuryInstance,
  lotteryBoxInstance,
  currentUser,
  showClaimPopUp,
  setShowClaimPopUp,
  round,
}) => {
  const [rewards, setRewards] = useState(0);
  const [selectedRound, setSelectedRound] = useState(0);
  const handleChange = useCallback(
    async (e) => {
      const _round = Number(e.target.value);
      setSelectedRound(_round);
      const winNumbers = await lotteryBoxInstance.s_winNumberList(
        Number(e.target.value)
      );
      const isNotClaimed = await lotteryBoxInstance.s_isNotClaimed(
        _round,
        currentUser,
        Number(winNumbers.toString())
      );

      if (isNotClaimed) {
        let reward = await treasuryInstance.s_rewardsPerWinner(_round);
        reward = ethers.utils.formatEther(reward.toString());
        setRewards(Number(reward));
      } else {
        setRewards(0);
      }
    },
    [lotteryBoxInstance, currentUser, treasuryInstance]
  );

  const claim = useCallback(async () => {
    const _round = Number(selectedRound);
    const winNumbers = await lotteryBoxInstance.s_winNumberList(_round);
    const isNotClaimed = await lotteryBoxInstance.s_isNotClaimed(
      _round,
      currentUser,
      Number(winNumbers.toString())
    );
    if (isNotClaimed) {
      const tx = await lotteryBoxInstance.claim(_round);
      MsgInfo("Please wait....");
      await tx.wait();
      await MsgSuccess("Claimed!");
      await setRewards(0);
    } else {
      MsgError("You don't have any rewards");
    }
  }, [lotteryBoxInstance, selectedRound]);

  return (
    <Wrapper show={showClaimPopUp}>
      <SubTitle marginSize={"2rem"} size={"3rem"}>
        Select Round
      </SubTitle>
      <Selected onChange={handleChange}>
        {Array(Number(round) - 1)
          .fill(0)
          .map((v, i) => (
            <option key={v + i} value={i + 1}>
              Round {i + 1}
            </option>
          ))}
      </Selected>
      <SubTitle marginSize={"2rem"} size={"3rem"}>
        Won Rewards
      </SubTitle>
      <SubTitle marginSize={"1rem"} size={"2rem"}>
        {rewards} ETH
      </SubTitle>
      <BtnBox>
        <Btn onClick={claim}>Claim</Btn>
        <Btn onClick={() => setShowClaimPopUp(false)}>Close</Btn>
      </BtnBox>
    </Wrapper>
  );
};

export default Claim;

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

const Selected = styled.select`
  font-size: ${(props) => props.theme.fontSizes.medium};
  width: 70%;
  margin: 0 auto;
  background-color: rgba(14, 14, 14, 0.85);
  color: white;
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
    margin: 3rem 0;
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

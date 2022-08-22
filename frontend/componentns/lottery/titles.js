import { useCallback } from "react";
import styled from "styled-components";
import { MsgError } from "../utils/utils";

//red, pink, blue, green, purple, orange
const colours = [
  [179, 20, 15, 1],
  [185, 0, 162, 1],
  [9, 60, 166, 1],
  [0, 156, 33, 1],
  [111, 48, 158, 1],
  [247, 178, 0, 1],
];
const Titles = ({
  balanceOfTreasury,
  round,
  ticketfee,
  rewardsTicketfee,
  lastRoundWinNumber,
  setShowBuyPopUp,
  currentUser,
  setShowClaimPopUp,
}) => {
  const openBuy = useCallback(() => {
    if (!currentUser) return MsgError("Please Connect First");
    setShowBuyPopUp(true);
  }, [currentUser]);

  const openClaim = useCallback(() => {
    if (!currentUser) return MsgError("Please Connect First");
    setShowClaimPopUp(true);
  }, [currentUser]);

  setShowClaimPopUp;
  return (
    <>
      <MainTitle>Play Now</MainTitle>

      <SubTitle marginSize={"2rem"} size={"4rem"}>
        Last round
      </SubTitle>

      <LotteryNumberBox>
        {colours.map((v, i) => {
          return (
            <LotteryNumber key={i} bg={v}>
              {lastRoundWinNumber[i]}
            </LotteryNumber>
          );
        })}
      </LotteryNumberBox>
      <SubTitle marginSize={"2rem"} size={"4rem"}>
        Open at every 3am
      </SubTitle>
      <SubTitle marginSize={"1rem"} size={"4rem"}>
        Current Rewards
      </SubTitle>
      <SubTitle marginSize={"2rem"} size={"3rem"}>
        {balanceOfTreasury} Eth
      </SubTitle>
      <SubTitle marginSize={"2rem"} size={"3rem"}>
        Round {round}
      </SubTitle>
      <BtnBox>
        <Btn onClick={openBuy}>Play</Btn>
        <Btn onClick={openClaim}>Claim</Btn>
      </BtnBox>
    </>
  );
};
export default Titles;

const MainTitle = styled.div`
  width: 100%;
  text-align: center;
  font-size: ${(props) => props.theme.fontSizes.x3large};
  font-family: ${(props) => props.theme.fonts.title2};
  letter-spacing: 10px;
  @media (max-width: 600px) {
    font-size: ${(props) => props.theme.fontSizes.xlarge};
  }
`;
const SubTitle = styled.div`
  width: 100%;
  text-align: center;
  font-size: ${(props) => props.size};
  font-family: ${(props) => props.theme.fonts.normal};
  letter-spacing: 10px;
  margin: ${(props) => props.marginSize} 0;
`;
const LotteryNumberBox = styled.div`
  display: flex;
  width: 100%;
  text-align: center;
  justify-content: center;
  align-items: center;
`;
const LotteryNumber = styled.div`
  font-size: ${(props) => props.theme.fontSizes.large};
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  background-color: rgba(${(props) => props.bg.join()});
  border-radius: 50%;
  width: 120px;
  height: 120px;
  margin: 0.5%;
  @media (max-width: 600px) {
    width: 70px;
    height: 70px;
  }
`;

const BtnBox = styled.div`
  display: flex;
  margin 0 auto;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const Btn = styled.div`
  width: 100%;
  text-align: center;
  display: flex;
  font-size: ${(props) => props.theme.fontSizes.medium};
  cursor: pointer;
  border: 1px solid white;
  padding: 1rem 1rem;
  margin: 0.5rem 0;
  justify-content: center;
  &:hover {
    text-shadow: ${(props) => props.theme.shadow.textShadow};
    box-shadow: ${(props) => props.theme.shadow.lightShadow};
  }
`;

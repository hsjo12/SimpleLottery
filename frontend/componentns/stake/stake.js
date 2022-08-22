import { ethers } from "ethers";
import { useCallback, useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { MsgError, MsgInfo, MsgSuccess } from "../utils/utils";
import StakeAddress from "../../artifacts/address/StakeBoxAddress.json";
const Stake = ({ ticektInstance, stakeInstance, currentUser }) => {
  const MAX = ethers.constants.MaxUint256;
  const [earnedRewards, setEarnedRewards] = useState(0);
  const [stakedTKT, setStakedTKT] = useState(0);
  const [inputValue, setInputValue] = useState(0);
  const [isApproval, SetIsApproval] = useState(false);
  useEffect(() => {
    if (currentUser && ticektInstance && stakeInstance) setUp();
  }, [currentUser, stakeInstance, ticektInstance]);

  const setUp = useCallback(async () => {
    getStakedTKT();
    getStakedEarnedRKT();
    const tktAllowance = await ticektInstance.allowance(
      currentUser,
      StakeAddress.address
    );
    SetIsApproval(tktAllowance.toString() === MAX.toString());
  }, [currentUser, stakeInstance, ticektInstance]);

  const getStakedTKT = useCallback(async () => {
    let stakedTKT = await stakeInstance.balanceOf(currentUser);
    stakedTKT = ethers.utils.formatEther(stakedTKT.toString());
    setStakedTKT(Number(stakedTKT.toString()));
  }, [currentUser, stakeInstance, ticektInstance]);

  const getStakedEarnedRKT = useCallback(async () => {
    let earnedRewrds = await stakeInstance.earned(currentUser);
    earnedRewrds = ethers.utils.formatEther(earnedRewrds.toString());
    setEarnedRewards(earnedRewrds.toString().substr(0, 10));
  }, [currentUser, stakeInstance]);

  const onChange = useCallback((e) => {
    if (e.target.value.length > 5) {
      return MsgError("Invalid Numbers");
    }
    setInputValue(e.target.value);
  }, []);

  const approveTKT = useCallback(async () => {
    const MAX = ethers.constants.MaxUint256;
    const tx = await ticektInstance.approve(stakeInstance.address, MAX);
    MsgInfo("Please wait....");
    await tx.wait();
    const tktAllowance = await ticektInstance.allowance(
      currentUser,
      StakeAddress.address
    );
    SetIsApproval(tktAllowance.toString() === MAX.toString());
    return MsgSuccess("Approved!");
  }, [ticektInstance, stakeInstance, currentUser]);

  const stakTKT = useCallback(async () => {
    if (0.00001 > Number(inputValue) || 99999 < Number(inputValue))
      return MsgError("Invalid Numbers");
    const inputTKT = ethers.utils.parseEther(inputValue).toString();
    await stakeInstance.stake(inputTKT);
    const tx = await getStakedTKT();
    MsgInfo("Please wait....");
    await tx.wait();
    await getStakedEarnedRKT();
    return await MsgSuccess("Staked!");
  }, [inputValue, ticektInstance, stakeInstance, currentUser]);
  const claimRKT = useCallback(async () => {
    let earnedRewrds = await stakeInstance.earned(currentUser);
    if (Number(earnedRewrds.toString() === 0))
      return MsgError("Nothing to Claim!");
    const tx = await stakeInstance.getReward();
    MsgInfo("Please wait....");
    await tx.wait();
    await getStakedTKT();
    await getStakedEarnedRKT();
    return await MsgSuccess("Claimed!");
  }, [inputValue, ticektInstance, stakeInstance, currentUser]);

  const withdraw = useCallback(async () => {
    let withdrawTKT = await stakeInstance.balanceOf(currentUser);
    if (Number(withdrawTKT.toString() === 0))
      return MsgError("Nothing to withdraw!");
    const tx = await stakeInstance.withdraw(withdrawTKT);
    MsgInfo("Please wait....");
    await tx.wait();
    await getStakedTKT();
    await getStakedEarnedRKT();
    return await MsgSuccess("Withdrew!");
  }, [inputValue, ticektInstance, stakeInstance, currentUser]);

  useInterval(() => {
    getStakedEarnedRKT();
  }, 60000);

  function useInterval(callback, delay) {
    const savedCallback = useRef();
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  return (
    <>
      <MainTitle>Stake</MainTitle>
      <Box>
        <SubTitle marginSize={"0.8rem"} size={"3rem"}>
          Stake TKT
        </SubTitle>
        <Input
          onChange={onChange}
          value={inputValue}
          type="number"
          min="0.0000001"
          max="100000000"
          placeholder="stake tkt (e.g 1 tkt = 10^18 tkt)"
        />

        {isApproval ? (
          <Btn onClick={stakTKT}>Stake TKT</Btn>
        ) : (
          <Btn onClick={approveTKT}>Approve TKT</Btn>
        )}

        <SubTitle marginSize={"0.8rem"} size={"3rem"}>
          Claim RKT
        </SubTitle>
        <SubTitle marginSize={"0.8rem"} size={"3rem"}>
          {earnedRewards}
        </SubTitle>
        <Btn onClick={claimRKT}>Claim RKT</Btn>

        <SubTitle marginSize={"0.8rem"} size={"3rem"}>
          Staked TKT
        </SubTitle>
        <SubTitle marginSize={"0.8rem"} size={"3rem"}>
          {stakedTKT}
        </SubTitle>
        <Btn onClick={withdraw}>Withdraw</Btn>
      </Box>
    </>
  );
};

export default Stake;
const MainTitle = styled.div`
  width: 100%;
  text-align: center;
  font-size: ${(props) => props.theme.fontSizes.x3large};
  font-family: ${(props) => props.theme.fonts.title2};
  letter-spacing: 10px;
  margin: 1rem 0;
`;
const SubTitle = styled.div`
  width: 100%;
  text-align: center;
  font-size: ${(props) => props.size};
  font-family: ${(props) => props.theme.fonts.normal};
  letter-spacing: 10px;
  margin: ${(props) => props.marginSize} 0;
`;

const Box = styled.div`
  border: 1px solid white;
  width: 80%;
  margin: 0 auto;
  display: flex;
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

const Btn = styled.div`
  display: flex;
  margin: 0.5rem 0;
  font-size: ${(props) => props.theme.fontSizes.medium};
  cursor: pointer;
  border: 1px solid white;
  padding: 1rem 2rem;
  margin: 1rem 0;
  justify-content: center;
  &:hover {
    text-shadow: ${(props) => props.theme.shadow.textShadow};
    box-shadow: ${(props) => props.theme.shadow.lightShadow};
  }
`;

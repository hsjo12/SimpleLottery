import { useCallback, useEffect, useContext } from "react";
import { SetUpUserInfo } from "../utils/utils";
import { ContextApI } from "../../contextAPI/lotteryContext";
import styled from "styled-components";

const ConnectBTN = () => {
  const { currentUser, setCurrentUser } = useContext(ContextApI);
  useEffect(() => {
    if (window.ethereum._metamask.isUnlocked()) {
      connect();
    }
  });
  useEffect(() => {
    window &&
      window.ethereum.on("accountsChanged", () => {
        connect();
      });
    window &&
      window.ethereum.on("chainChanged", (chainId) => {
        if (chainId.toString() !== "0x5") {
          connect();
        }
      });
  }, []);
  const connect = useCallback(async () => {
    const user = await SetUpUserInfo();

    setCurrentUser(user);
  }, []);
  return (
    <>
      {currentUser ? (
        <>
          {currentUser.substr(0, 3)}...{currentUser.substr(-3)}
        </>
      ) : (
        <BTN onClick={connect}>Connect </BTN>
      )}
    </>
  );
};

export default ConnectBTN;

const BTN = styled.div`
  color: white;
  font-size: ${(props) => props.theme.fontSizes.medium};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-item: center;
  cursor: pointer;
  &:hover {
    text-shadow: ${(props) => props.theme.shadow.textShadow};
  }
  @media (max-width: 600px) {
    font-size: ${(props) => props.theme.fontSizes.small};
  }
`;

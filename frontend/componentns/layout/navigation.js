import styled from "styled-components";
import Link from "next/link";
import ConnectBTN from "../wallet/connectBTN";
import { ContextApI } from "../../contextAPI/lotteryContext";
import { useContext } from "react";
const Navigation = () => {
  const { currentUser } = useContext(ContextApI);
  return (
    <NavBox>
      <NavMenuBox>
        <Link href="/">
          <Logo>Lottery</Logo>
        </Link>

        <ItemBox>
          {currentUser && (
            <Link href="/stake">
              <NavItem>Stake</NavItem>
            </Link>
          )}
          <WalletBtnBox>
            <ConnectBTN />
          </WalletBtnBox>
        </ItemBox>
      </NavMenuBox>
    </NavBox>
  );
};

const NavBox = styled.div`
  width: 100%;
  display: grid;
  margin: 0 auto;
  background-color: rgba(0, 0, 0, 1);
`;
const WalletBtnBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-item: center;
`;

const NavMenuBox = styled.div`
  display: flex;
  justify-content: space-around;
`;
const Logo = styled.div`
  font-family: ${(props) => props.theme.fonts.title1};
  font-size: ${(props) => props.theme.fontSizes.xlarge};
  letter-spacing: 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-transform: uppercase;
  &:hover {
    text-shadow: ${(props) => props.theme.shadow.textShadow};
  }

  @media (max-width: 900px) {
    font-size: ${(props) => props.theme.fontSizes.large};
  }
  @media (max-width: 600px) {
    font-size: ${(props) => props.theme.fontSizes.medium};
  }
`;

const NavItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
  text-transform: capitalize;
  padding: 0 3rem;
  font-size: ${(props) => props.theme.fontSizes.medium};
  &:hover {
    text-shadow: ${(props) => props.theme.shadow.textShadow};
  }
  @media (max-width: 600px) {
    font-size: ${(props) => props.theme.fontSizes.small};
    padding: 0 1rem;
  }
`;

const ItemBox = styled.div`
  display: flex;
  font-size: ${(props) => props.theme.fontSizes.medium};
  @media (max-width: 600px) {
    font-size: ${(props) => props.theme.fontSizes.small};
  }
`;
export default Navigation;

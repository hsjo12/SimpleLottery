import styled from "styled-components";
const Footer = () => {
  return (
    <FooterBox>
      <Logo>copyrightⓒ 2022 All right reserved by Daehwan</Logo>
    </FooterBox>
  );
};
const FooterBox = styled.div`
  width: 100%;
  padding: 2rem 0;
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const Logo = styled.div`
  font-family: ${(props) => props.theme.fonts.second};
  font-weight: 400;
  font-size: ${(props) => props.theme.fontSizes.Xsmall};
  text-align: center;
  text-transform: uppercase;
  color: ${(props) => props.theme.colors.white};
  @media all and (max-width: 767px) {
    font-size: 20px;
  }
`;

export default Footer;

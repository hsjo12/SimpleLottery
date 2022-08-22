import styled, { keyframes } from "styled-components";
import Navigation from "./navigation";
import Footer from "./footer";

const Layout = ({ children }) => {
  return (
    <Outer>
      <Innner>
        <Navigation />
        <Contents>{children}</Contents>

        <Footer />
      </Innner>
    </Outer>
  );
};
const appear = keyframes`
0% {
  opacity: 0;
}
50% {
  opacity: 0.5;
}
100% {
  opacity: 1;
}
`;
const Outer = styled.div`
  display: flex;
  width: 100vw;
  min-height: 100vh;
  animation: ${appear} 3s ease-in-out 1;
`;
const Innner = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 auto;
`;
const Contents = styled.div`
  width: 100%;
  min-height: 90vh;
`;
export default Layout;

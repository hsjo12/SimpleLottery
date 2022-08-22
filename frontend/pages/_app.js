import { ThemeProvider } from "styled-components";
import { theme, GlobalStyle } from "../styles/globalAndTheme";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LotteryContext } from "../contextAPI/lotteryContext";
import Layout from "../componentns/layout/layout";
function MyApp({ Component, pageProps }) {
  return (
    <>
      <GlobalStyle />
      <ToastContainer />
      <LotteryContext>
        <ThemeProvider theme={theme}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ThemeProvider>
      </LotteryContext>
    </>
  );
}

export default MyApp;

import { toast } from "react-toastify";
import { ethers } from "ethers";

export const MsgError = (text) => {
  return toast.error(text, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

export const MsgSuccess = (text) => {
  return toast.success(text, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

export const MsgInfo = (text) => {
  return toast.info(text, {
    position: "top-center",
    autoClose: 18000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};
export const RequestNetwork = async () => {
  try {
    MsgError("Please use goeril!");
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x5" }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x5",
              chainName: "goerli",
              rpcUrls: [
                "https://eth-goerli.g.alchemy.com/v2/mtjnHtG0-z-rtx5zAtMMVq19a0tdo5N_",
              ] /* ... */,
            },
          ],
        });
      } catch (addError) {}
    }
  }
};

export const SetUpUserInfo = async () => {
  if (window.ethereum) {
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      if (ethereum.networkVersion.toString() !== "5") {
        RequestNetwork();
      }
      return accounts[0];
    } catch (error) {
      if (error.code === "4001") {
        return MsgError("Please connect to MetaMask.");
      }
    }
  } else {
    return MsgError("Please Install MetaMask");
  }
  console.log("ethereum", ethereum.networkVersion.toString());
};

export const SetUpContractForOnlyRead = async (_contractAddr, _contractAbi) => {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://eth-goerli.g.alchemy.com/v2/mtjnHtG0-z-rtx5zAtMMVq19a0tdo5N_"
  );
  const instnace = new ethers.Contract(_contractAddr, _contractAbi, provider);
  return instnace;
};

export const SetUpContract = async (_contractAddr, _contractAbi) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const instnace = await new ethers.Contract(
    _contractAddr,
    _contractAbi,
    signer
  );
  return instnace;
};

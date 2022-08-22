import { createContext, useState } from "react";

export const ContextApI = createContext();

export const LotteryContext = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showBuyPopUp, setShowBuyPopUp] = useState(false);
  const [balanceOfTreasury, setBalanceOfTreasury] = useState(false);
  const [showClaimPopUp, setShowClaimPopUp] = useState(false);
  return (
    <ContextApI.Provider
      value={{
        currentUser,
        setCurrentUser,
        showBuyPopUp,
        setShowBuyPopUp,
        balanceOfTreasury,
        setBalanceOfTreasury,
        showClaimPopUp,
        setShowClaimPopUp,
      }}
    >
      {children}
    </ContextApI.Provider>
  );
};

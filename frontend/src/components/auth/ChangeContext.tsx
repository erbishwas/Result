import { createContext, useContext, useState } from "react";


type ChangeContextType = {
  version: number;
  notifyChange: () => void;
};

const ChangeContext = createContext<ChangeContextType | null>(null);

export const ChangeProvider = ({ children }: { children: React.ReactNode }) => {
  const [version, setVersion] = useState(0);

  const notifyChange = () => {
    setVersion((v) => v + 1);
    console.log("Change notified, new version:", version);
  };

  return (
    <ChangeContext.Provider value={{ version, notifyChange }}>
      {children}
    </ChangeContext.Provider>
  );
};

export const useChange = () => {
  const ctx = useContext(ChangeContext);
  if (!ctx) throw new Error("useChange must be used inside ChangeProvider");
  return ctx;
};

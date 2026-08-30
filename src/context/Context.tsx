import { createContext, useContext, ReactNode } from "react";

interface AppContextType {
  [key: string]: any;
}

const AppContext = createContext<AppContextType>({});

interface AppContextProviderProps {
  children?: ReactNode;
}

const AppContextProvider = ({ children }: AppContextProviderProps) => {
  return (
    <AppContext.Provider value={{}}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => useContext(AppContext);

export { AppContext as default, AppContextProvider, useAppContext };


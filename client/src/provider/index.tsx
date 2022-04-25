import React, { createContext, useContext, useReducer } from "react";
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { IAction, IState } from "types/context";
import { getClusterDetail } from 'utils/solana';
import AppReducer from "./AppReducer";
import WalletProvider from './WalletProvider';

const initialState: IState = {
};

export const GlobalContext = createContext<{
  state: IState;
  dispatch: React.Dispatch<IAction>;
}>({ state: initialState, dispatch: () => undefined });

export const useStore = () => {
  const store = useContext(GlobalContext);
  return store;
};

export const Provider = ({ children }: { children: React.ReactChild }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);
  const {clusterApiUrl} = getClusterDetail()

  return (
    <ConnectionProvider endpoint={clusterApiUrl}>
      <WalletProvider>
        <GlobalContext.Provider value={{ state, dispatch }}>
          {children}
        </GlobalContext.Provider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

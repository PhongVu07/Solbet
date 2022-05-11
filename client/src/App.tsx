import React from "react";
import "./App.css";
import AppRoute from "AppRoute";
import { Provider } from "provider";

function App() {
  return (
    <Provider>
      <AppRoute />
    </Provider>
  );
}

export default App;

import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PAGES } from "constants/pages";
import Layout from "components/Layout";
import Home from "pages/Home";
import PoolManager from "pages/PoolManager";
import PoolDetail from "pages/PoolDetail";

const AppRoute = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path={PAGES.HOME} element={<Home />} />
          <Route path={PAGES.POOL_MANAGER} element={<PoolManager />} />
          <Route path={PAGES.STAKING} element={<PoolDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};
export default AppRoute;

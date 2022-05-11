import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PAGES } from "constants/pages";
import Layout from "components/Layout";
import Home from "pages/Home";
import PoolManager from "pages/PoolManager";
import PoolDetail from "pages/PoolDetail";

const AppRoute = () => {
  return (
    <Layout>
      <BrowserRouter>
        <Routes>
          <Route path={PAGES.HOME} element={<Home />} />
          <Route path={PAGES.POOL_MANAGER} element={<PoolManager />} />
          <Route path={PAGES.POOL_DETAIL} element={<PoolDetail />} />
        </Routes>
      </BrowserRouter>
    </Layout>
  );
};
export default AppRoute;

import React, { useState } from "react";

import { ComponentContainer, PageContent, PageTab } from "./style";
import { Button } from "antd";
import CreatePoolForm from "./components/CreatePoolForm";
import ManagePool from "./components/ManagePool";

enum MANAGER_TAB {
  CREATE = "Create Pool",
  MANAGE = "Manage Pool",
}

const PoolManager: React.FC = () => {
  const [tab, setTab] = useState<MANAGER_TAB>(MANAGER_TAB.MANAGE);
  const isCreateTab = tab === MANAGER_TAB.CREATE;

  return (
    <ComponentContainer>
      <PageTab>
        <Button
          type={isCreateTab ? "primary" : "default"}
          onClick={() => setTab(MANAGER_TAB.CREATE)}
        >
          {MANAGER_TAB.CREATE}
        </Button>
        <Button
          type={!isCreateTab ? "primary" : "default"}
          onClick={() => setTab(MANAGER_TAB.MANAGE)}
        >
          {MANAGER_TAB.MANAGE}
        </Button>
      </PageTab>
      <PageContent>{isCreateTab ? <CreatePoolForm /> : <ManagePool></ManagePool>}</PageContent>
    </ComponentContainer>
  );
};
export default PoolManager;

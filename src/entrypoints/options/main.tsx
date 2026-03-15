import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.js";
import "~/assets/tailwind.css";
import { StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider, App as AntdApp } from "antd";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StyleProvider layer>
      <ConfigProvider>
        <AntdApp>
          <App />
        </AntdApp>
      </ConfigProvider>
    </StyleProvider>
  </React.StrictMode>
);

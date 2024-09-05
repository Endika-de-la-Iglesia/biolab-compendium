import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import store from "./store/configureStore";
import "./style/main.scss";
import Loading from "./components/Loading";

const AppInitializer = React.lazy(() => import("./components/AppInitializer"));

function main() {
  const root = createRoot(document.querySelector(".app-wrapper"));

  root.render(
    <Provider store={store}>
      <Suspense fallback={<Loading />}>
        <AppInitializer />
      </Suspense>
    </Provider>
  );
}

document.addEventListener("DOMContentLoaded", main);

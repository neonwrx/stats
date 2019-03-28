import React from "react";
import ReactDOM from "react-dom";

import { createStore, applyMiddleware, compose } from "redux";
import { sessionService } from "redux-react-session";
import { Provider } from "react-redux";
import reduxThunk from "redux-thunk";

import "bootstrap/dist/css/bootstrap.css";

import App from "./components/App";
import * as serviceWorker from "./serviceWorker";
import reducers from "./reducers";

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  reducers,
  composeEnhancer(applyMiddleware(reduxThunk))
);

// Init the session service
sessionService.initSessionService(store);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

serviceWorker.unregister();

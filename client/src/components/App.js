import React from "react";
import { connect } from "react-redux";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import Home from "./Home";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import Payments from "./Payments";
import PartnersPayments from "./PartnersPayments";
import PrivateRoute from "./PrivateRoute";

const App = ({ authenticated, checked }) => (
  <BrowserRouter>
    {checked && (
      <Switch>
        <PrivateRoute
          exact
          path="/"
          component={Home}
          authenticated={authenticated}
        />
        <Route path="/signin" component={SignIn} />
        <Route path="/signup" component={SignUp} />
        <PrivateRoute
          path="/payments"
          component={Payments}
          authenticated={authenticated}
        />
        <PrivateRoute
          path="/partners-payments"
          component={PartnersPayments}
          authenticated={authenticated}
        />
      </Switch>
    )}
  </BrowserRouter>
);

function mapStateToProps({ session }) {
  return {
    checked: session.checked,
    authenticated: session.authenticated
  };
}

export default connect(
  mapStateToProps,
  {}
)(App);

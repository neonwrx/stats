import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from "react-router";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink
} from "reactstrap";
import PropTypes from "prop-types";

import { fetchAccountBalance, logout } from "../actions";

class Header extends PureComponent {
  static propTypes = {
    authenticated: PropTypes.bool,
    user: PropTypes.object,
    balance: PropTypes.number,
    fetchAccountBalance: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired
  };

  componentDidMount() {
    const { authenticated, fetchAccountBalance } = this.props;
    if (authenticated) {
      fetchAccountBalance();
    }
  }

  state = {
    isOpen: false
  };

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };

  logout(e) {
    e.preventDefault();
    const { history, logout } = this.props;
    logout(history);
  }

  renderBalance() {
    function addZeroes(num) {
      var value = Number(num);
      var res = num.split(".");
      if (res.length === 1 || res[1].length < 3) {
        value = value.toFixed(2);
      }
      return value;
    }
    let num = String(this.props.balance);
    return addZeroes(num);
  }

  renderPayments(rights) {
    if (rights === "admin") {
      return (
        <NavItem>
          <Link
            className="nav-link payments-link partners-payments-link"
            to={"/partners-payments"}
          >
            Выплаты
          </Link>
        </NavItem>
      );
    }
  }

  renderAuthMenu() {
    const { authenticated, user } = this.props;
    const { rights, email } = user;
    if (authenticated) {
      return (
        <Nav className="ml-auto" navbar>
          <NavItem>
            <NavLink href="" onClick={e => e.preventDefault()}>
              {email}
            </NavLink>
          </NavItem>
          {this.renderPayments(rights)}
          <NavItem>
            <Link className="nav-link payments-link" to={"/payments"}>
              Ваш баланс: {this.renderBalance()} руб
            </Link>
          </NavItem>
          <NavItem>
            <NavLink href="" onClick={e => this.logout(e)}>
              Выйти
            </NavLink>
          </NavItem>
        </Nav>
      );
    }
  }

  render() {
    return (
      <div>
        <Navbar color="dark" dark expand="md">
          <NavbarBrand tag={Link} to={"/"}>
            Статистика
          </NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            {this.renderAuthMenu()}
          </Collapse>
        </Navbar>
      </div>
    );
  }
}

function mapStateToProps({ session, paymentsReducer }) {
  return {
    authenticated: session.authenticated,
    user: session.user,
    balance: paymentsReducer.balance
  };
}

export default withRouter(
  connect(
    mapStateToProps,
    { logout, fetchAccountBalance }
  )(Header)
);

import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Table,
  Row,
  Col,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
  Badge
} from "reactstrap";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import Loader from "react-loader-spinner";
import PropTypes from "prop-types";

import Header from "./Header";
import { fetchData } from "../actions";
import "../App.css";

class App extends Component {
  static propTypes = {
    fetchData: PropTypes.func.isRequired,
    user: PropTypes.object,
    dataList: PropTypes.object
  };

  state = {
    dropdownOpenPartners: false,
    date: [this.startDay(), new Date()],
    partner: "",
    showData: true
  };

  componentDidMount() {
    const { partner } = this.state;
    let startDay = this.getData(this.state.date[0]);
    let endDay = this.getData(this.state.date[1]);
    this.props.fetchData(startDay, endDay, partner);
  }

  startDay() {
    var day = new Date();
    day.setDate(day.getDate() - 6);
    return day;
  }

  getData(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (month < 10) {
      month = "0" + month;
    }
    if (day < 10) {
      day = "0" + day;
    }
    return `${year}-${month}-${day}`;
  }

  fetchData() {
    const { partner } = this.state;
    let startDay = this.getData(this.state.date[0]);
    let endDay = this.getData(this.state.date[1]);
    this.props.fetchData(startDay, endDay, partner);
  }

  onChangeDate = date => {
    this.setState({ date });
  };

  togglePartners() {
    this.setState(prevState => ({
      dropdownOpenPartners: !prevState.dropdownOpenPartners
    }));
  }

  renderPartners(user) {
    const { partners } = user;
    return partners.map((item, index) => {
      return (
        <DropdownItem
          key={index}
          value={item}
          onClick={event => this.selectPartner(event)}
        >
          {item}
        </DropdownItem>
      );
    });
  }

  selectPartner(event) {
    this.setState({ partner: event.target.value, showData: true });
    this.fetchData();
  }

  showPartners() {
    const { user } = this.props;
    const { rights } = user;
    if (rights === "admin") {
      return (
        <Col lg="4" className="d-flex align-items-center">
          <Dropdown
            isOpen={this.state.dropdownOpenPartners}
            toggle={() => this.togglePartners()}
          >
            <DropdownToggle color="info" caret>
              Выберите партнера
            </DropdownToggle>
            <DropdownMenu
              modifiers={{
                setMaxHeight: {
                  enabled: true,
                  order: 890,
                  fn: data => {
                    return {
                      ...data,
                      styles: {
                        ...data.styles,
                        overflow: "auto",
                        maxHeight: 200
                      }
                    };
                  }
                }
              }}
            >
              {this.renderPartners(user)}
            </DropdownMenu>
          </Dropdown>
          <div className="partner ml-4">
            <Badge
              href="#"
              color="secondary"
              className="closePartner"
              onClick={e => this.closePartner(e)}
            >
              {this.state.partner}
            </Badge>
          </div>
        </Col>
      );
    }
  }

  closePartner(e) {
    e.preventDefault();
    this.setState({ partner: "", showData: false });
  }

  renderData() {
    const { dataList } = this.props;
    const { success, loading, priceWeb, priceMob, data } = dataList;
    const { showData } = this.state;
    if (loading) {
      return (
        <tr>
          <td colSpan="8">
            <Loader type="ThreeDots" color="#17a2b8" height="40" width="40" />
          </td>
        </tr>
      );
    }
    if (!success || !showData) {
      return (
        <tr>
          <td colSpan="8">Нет данных</td>
        </tr>
      );
    }
    return data.map((item, index) => {
      const { day, mobile, desk, ru, other } = item;
      const revenueM = mobile * Number(priceMob);
      const revenueW = desk * Number(priceWeb);
      return (
        <tr key={index}>
          <td>{day}</td>
          <td>{mobile}</td>
          <td>{desk}</td>
          <td>{ru}</td>
          <td>{other}</td>
          <td>{revenueM}</td>
          <td>{revenueW}</td>
          <td>{revenueM + revenueW}</td>
        </tr>
      );
    });
  }

  render() {
    return (
      <div>
        <Header />
        <br />
        <div className="container-fluid">
          <Row className="home-top-block">
            {this.showPartners()}
            <Col lg="5" className="d-flex flex-wrap">
              <DateRangePicker
                onChange={this.onChangeDate}
                value={this.state.date}
                maxDate={new Date()}
                showLeadingZeros={true}
              />{" "}
              <Button
                color="info"
                className="accept-btn"
                onClick={() => this.fetchData()}
              >
                Применить
              </Button>
            </Col>
          </Row>
          <Table striped bordered responsive hover>
            <thead>
              <tr>
                <th>Дата</th>
                <th>
                  Кол-во уникальных кликов
                  <br /> Мобильный трафик
                </th>
                <th>
                  Кол-во уникальных кликов
                  <br /> Web трафик
                </th>
                <th>
                  Посещаемость сайта <br />
                  Трафик с территории РФ в %
                </th>
                <th>
                  Посещаемость сайта <br />
                  Трафик с территории других стран в %
                </th>
                <th>
                  Доход (руб.) <br />
                  Мобильный трафик
                </th>
                <th>
                  Доход (руб.) <br />
                  Web трафик
                </th>
                <th>Общий доход (руб.)</th>
              </tr>
            </thead>
            <tbody>{this.renderData()}</tbody>
          </Table>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ dataReducer, session }) {
  return {
    user: session.user,
    dataList: dataReducer
  };
}

export default connect(
  mapStateToProps,
  { fetchData }
)(App);

import React, { Component } from "react";
import { connect } from "react-redux";
import { Table } from "reactstrap";
import PropTypes from "prop-types";

import Header from "./Header";
import { getPayments, newPayment } from "../actions";

class PartnersPayments extends Component {
  static propTypes = {
    getPayments: PropTypes.func.isRequired,
    success: PropTypes.bool,
    payments: PropTypes.array
  };

  componentDidMount() {
    const { getPayments } = this.props;
    getPayments();
  }

  renderPayments() {
    const { success, payments } = this.props;
    if (!success) {
      return (
        <tr>
          <td colSpan="4">Нет данных</td>
        </tr>
      );
    }
    return payments.reverse().map((item, index) => {
      return (
        <tr key={index}>
          <td>{new Date(item.createDate).toLocaleString()}</td>
          <td>{item.paymentDate}</td>
          <td>{item.value}</td>
          <td>{item.status}</td>
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
          <h3>Список выплат:</h3>
          <div>
            <Table striped hover borderless>
              <thead>
                <tr>
                  <th>Дата создания</th>
                  <th>Дата оплаты</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>{this.renderPayments()}</tbody>
            </Table>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ paymentsReducer }) {
  return {
    payments: paymentsReducer.payments,
    success: paymentsReducer.success
  };
}

export default connect(
  mapStateToProps,
  { getPayments, newPayment }
)(PartnersPayments);

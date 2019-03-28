import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Button,
  Form,
  FormGroup,
  FormFeedback,
  Label,
  Input,
  Table
} from "reactstrap";
import PropTypes from "prop-types";

import Header from "./Header";
import { getPayments, newPayment } from "../actions";

class Payments extends Component {
  static propTypes = {
    getPayments: PropTypes.func.isRequired,
    newPayment: PropTypes.func.isRequired,
    success: PropTypes.bool,
    payments: PropTypes.array
  };

  state = {
    value: "",
    accountNumber: "",
    validate: {
      valueState: "",
      accountNumberState: ""
    }
  };

  componentDidMount() {
    const { getPayments } = this.props;
    getPayments();
  }

  submitForm(e) {
    e.preventDefault();
    const { newPayment } = this.props;
    const { value, accountNumber, validate } = this.state;
    const { valueState, accountNumberState } = validate;
    if (
      valueState.length !== 0 &&
      accountNumberState.length !== 0 &&
      valueState !== "has-danger" &&
      accountNumberState !== "has-danger"
    ) {
      newPayment({ value, accountNumber });
      alert("Выплата успешно заказана.");
    }
  }

  handleChange = async event => {
    const { target } = event;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const { name } = target;
    await this.setState({
      [name]: value
    });
  };

  disableButton() {
    const { validate } = this.state;
    const { valueState, accountNumberState } = validate;
    if (
      valueState.length !== 0 &&
      accountNumberState.length !== 0 &&
      valueState !== "has-danger" &&
      accountNumberState !== "has-danger"
    ) {
      return true;
    }
    return false;
  }

  validateSumm(e) {
    const valueRex = /^-?\d*[.,]?\d{0,2}$/;
    const { validate } = this.state;
    if (
      e.target.value.length >= 3 &&
      parseInt(e.target.value, 10) &&
      valueRex.test(e.target.value)
    ) {
      validate.valueState = "has-success";
    } else {
      validate.valueState = "has-danger";
    }
    this.setState({ validate });
  }

  validateAccountNumber(e) {
    const accNumberRex = /^\d*$/;
    const { validate } = this.state;
    if (e.target.value.length >= 9 && accNumberRex.test(e.target.value)) {
      validate.accountNumberState = "has-success";
    } else {
      validate.accountNumberState = "has-danger";
    }
    this.setState({ validate });
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
      const { createDate, paymentDate, value, status } = item;
      return (
        <tr key={index}>
          <td>{new Date(createDate).toLocaleString()}</td>
          <td>{paymentDate}</td>
          <td>{value}</td>
          <td>{status}</td>
        </tr>
      );
    });
  }

  render() {
    const { value, accountNumber, validate } = this.state;
    return (
      <div>
        <Header />
        <br />
        <div className="container-fluid">
          <h2>Заказ выплаты</h2>
          <br />
          <Form className="form" onSubmit={e => this.submitForm(e)}>
            <FormGroup className="payment_input">
              <Label for="exampleText">Сумма к выплате:</Label>
              <Input
                type="text"
                name="value"
                id="exampleText"
                placeholder="200.00"
                value={value}
                valid={validate.valueState === "has-success"}
                invalid={validate.valueState === "has-danger"}
                onChange={e => {
                  this.validateSumm(e);
                  this.handleChange(e);
                }}
              />
              <FormFeedback>Введите корректное значение</FormFeedback>
            </FormGroup>
            <FormGroup className="payment_input">
              <Label for="exampleText2">Счет Webmoney:</Label>
              <Input
                type="text"
                name="accountNumber"
                id="exampleText2"
                placeholder="Укажите Ваш кошелек"
                value={accountNumber}
                valid={validate.accountNumberState === "has-success"}
                invalid={validate.accountNumberState === "has-danger"}
                onChange={e => {
                  this.validateAccountNumber(e);
                  this.handleChange(e);
                }}
              />
              <FormFeedback>Введите корректное значение</FormFeedback>
            </FormGroup>
            <Button
              className={this.disableButton() ? "" : "outline"}
              outline
              color="success"
              disabled={this.disableButton() ? false : true}
            >
              Заказать выплату
            </Button>
          </Form>
          <br />
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
)(Payments);

import { FETCH_PAYMENTS, FETCH_ACCOUNT_BALANCE, NEW_PAYMENT } from '../actions/types';

const INITIAL_STATE = {
  payments: [],
  success: false,
  balance: 0,
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case FETCH_ACCOUNT_BALANCE:
      return { ...state, balance: action.payload.accountMoney };
    case FETCH_PAYMENTS:
      return { ...state, payments: action.payload.payments, success: action.payload.success };
    case NEW_PAYMENT:
      return { ...state, payments: [action.payload, ...state.payments] };
    default:
      return state;
  }
}

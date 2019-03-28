import axios from 'axios';
import { sessionService } from 'redux-react-session';

import {
  FETCH_DATA,
  FETCH_DATA_SUCCESS,
  FETCH_DATA_ERROR,
  FETCH_ACCOUNT_BALANCE,
  FETCH_PAYMENTS,
  NEW_PAYMENT,
  AUTH_FAILED,
  SIGN_IN,
} from './types';

// const url = 'http://192.168.1.105:8080/';
const url = 'http://64.52.87.61:8080/';

export const fetchData = (startDay, endDay, partner) => async (dispatch) => {
  dispatch({ type: FETCH_DATA });
  await sessionService.loadSession()
    .then( async token => {
      const res = await axios.get(`${url}api/data?startDay=${startDay}&endDay=${endDay}&token=${token}&partner=${partner}`);
      if (res.data.success) {
        dispatch({ type: FETCH_DATA_SUCCESS, payload: res.data });
      } else {
        dispatch({ type: FETCH_DATA_ERROR, payload: res.data });
      }
    })
    .catch(err => console.log(err))
};

export const fetchAccountBalance = () => async (dispatch) => {
  await sessionService.loadSession()
    .then( async token => {
      const res = await axios.get(`${url}api/data/all?token=${token}`);
      if (res.data.success && res.data.accountMoney) {
        dispatch({ type: FETCH_ACCOUNT_BALANCE, payload: res.data });
      }
    })
    .catch(err => console.log(err))
};

export const getPayments = () => async (dispatch) => {
  await sessionService.loadSession()
    .then( async token => {
      const res = await axios.get(`${url}api/payment?token=${token}`);
      dispatch({ type: FETCH_PAYMENTS, payload: res.data });
    })
    .catch(err => console.log(err))
};

export const newPayment = (data) => async (dispatch) => {
  await sessionService.loadSession()
    .then( async token => {
      const res = await axios.post(`${url}api/payment/new`, {data, token});
      if (res.data.success) {
        const createDate = new Date().toLocaleString();
        const status = 'В ожидании';
        const newData = {createDate, status, ...data};
        dispatch({ type: NEW_PAYMENT, payload: newData });
      }
    })
    .catch(err => console.log(err))
};

export const signin = (user, history) => async (dispatch) => {
  await axios.post(`${url}api/account/signin`, user)
  .then((res) => {
    if (res.data.success) {
      const { name, rights, partners, token } = res.data;
      const { email } = user;
      sessionService.saveSession(token)
      .then(() => {
        sessionService.saveUser({name, email, rights, partners, token})
        .then(() => {
          dispatch({ type: SIGN_IN });
          history.push('/');
        }).catch(err => console.error(err));
      }).catch(err => console.error(err));
    } else {
      dispatch({ type: AUTH_FAILED, payload: res.data });
    }
  })
  .catch(err => {
    dispatch({ type: AUTH_FAILED, payload: err });
    console.error(err);
  });
};

export const signup = (user, history) => async (dispatch) => {
  await axios.post(`${url}api/account/signup`, user)
  .then((res) => {
    if (res.data.success) {
      sessionService.saveSession(res.data.token)
      .then(() => {
        const { rights, partners } = res.data;
        const { email, name } = user;
        sessionService.saveUser({name, email, rights, partners})
        .then(() => {
          dispatch({ type: SIGN_IN });
          history.push('/');
        }).catch(err => console.error(err));
      }).catch(err => console.error(err));
    } else {
      dispatch({ type: AUTH_FAILED, payload: res.data });
    }
  })
  .catch(err => {
    dispatch({ type: AUTH_FAILED, payload: err });
    console.error(err);
  });
};

export const logout = (history) => {
  return () => {
    sessionService.deleteSession();
    sessionService.deleteUser();
    history.push('/signin');
  };
};

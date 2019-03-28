import { combineReducers } from 'redux';
import { sessionReducer } from 'redux-react-session';

import dataReducer from './dataReducer';
import paymentsReducer from './paymentsReducer';
import userReducer from './userReducer';

export default combineReducers({
  session: sessionReducer,
  dataReducer,
  paymentsReducer,
  userReducer,
});

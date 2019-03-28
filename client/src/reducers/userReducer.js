import { SIGN_IN, AUTH_FAILED } from '../actions/types';

const INITIAL_STATE = {
  success: true,
  message: ''
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case SIGN_IN:
      return { ...state, success: true, message: '' };
    case AUTH_FAILED:
      return { ...state, success: action.payload.success || false, message: action.payload.message || ''  };
    default:
      return state;
  }
}

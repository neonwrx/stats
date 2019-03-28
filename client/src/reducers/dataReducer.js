import { FETCH_DATA, FETCH_DATA_SUCCESS, FETCH_DATA_ERROR } from '../actions/types';

const INITIAL_STATE = {
  data: [],
  success: false,
  loading: false,
  priceWeb: 1,
  priceMob: 1
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case FETCH_DATA:
      return {
        ...state,
        loading: true
      }
    case FETCH_DATA_SUCCESS:
      return {
        ...state,
        data: action.payload.data,
        success: action.payload.success,
        priceWeb: action.payload.priceWeb,
        priceMob: action.payload.priceMob, 
        loading: false
      };
    case FETCH_DATA_ERROR:
      return { ...state, success: false, loading: false }
    default:
      return state;
  }
}

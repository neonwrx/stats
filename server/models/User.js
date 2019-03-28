const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    default: ''
  },
  accountMoney: {
    type: Number,
    default: 0
  },
  allMoney: {
    type: Number,
    default: 0
  },
  priceMob: {
    type: String,
    default: '10.5'
  },
  priceWeb: {
    type: Number,
    default: 2
  },
  payList: [
    {
      createDate: {
        type: Date,
        default: ''
      },
      paymentDate: {
        type: Date,
        default: null
      },
      value: {
        type: Number,
        default: 0
      },
      status: {
        type: String,
        default: 'В ожидании'
      },
      accountNumber: {
        type: String,
        default: ''
      }
    }
  ],
  userRights: {
    type: String,
    default: 'guest'
  },
  idSite: {
    type: String,
    default: ''
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  signUpDate: {
    type: Date,
    default: Date.now()
  }
});
UserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model('User', UserSchema);

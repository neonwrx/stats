const User = require('../../models/User');
const Helpers = require('../helpers');

module.exports = (app) => {

  app.post('/api/account/signup', (req, res, next) => {
    const { body } = req;
    const {
      password
    } = body;
    let {
      email,
      name
    } = body;

    if (!email) {
      return res.send({
        success: false,
        message: 'Error: Email cannot be blank.'
      });
    }
    if (!name) {
      return res.send({
        success: false,
        message: 'Error: Name cannot be blank.'
      });
    }
    if (!password) {
      return res.send({
        success: false,
        message: 'Error: Password cannot be blank.'
      });
    }

    email = email.toLowerCase();
    email = email.trim();

    // Steps:
    // 1. Verify email doesn't exist
    // 2. Save
    User.find({
      email: email
    }, (err, previousUsers) => {
      if (err) {
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      } else if (previousUsers.length > 0) {
        return res.send({
          success: false,
          message: 'Error: Account already exist.'
        });
      }

      // Save the new user
      const newUser = new User();

      newUser.email = email;
      newUser.name = name;
      newUser.password = newUser.generateHash(password);
      newUser.save((err, user) => {
        if (err) {
          return res.send({
            success: false,
            message: 'Error: Server error'
          });
        }
        return res.send({
          success: true,
          // message: 'Signed up',
          token: user._id,
          name: user.name,
          rights: user.userRights,
        });
      });
    });

  });

  app.post('/api/account/signin', (req, res, next) => {
    const { body } = req;
    const {
      password
    } = body;
    let {
      email
    } = body;


    if (!email) {
      return res.send({
        success: false,
        message: 'Error: Email cannot be blank.'
      });
    }
    if (!password) {
      return res.send({
        success: false,
        message: 'Error: Password cannot be blank.'
      });
    }

    email = email.toLowerCase();
    email = email.trim();

    User.find({
      email: email
    }, (err, users) => {
      if (err) {
        console.log('err 2:', err);
        return res.send({
          success: false,
          message: 'Error: server error'
        });
      }
      if (users.length != 1) {
        return res.send({
          success: false,
          message: 'Error: User is not found'
        });
      }

      const user = users[0];
      if (!user.validPassword(password)) {
        return res.send({
          success: false,
          message: 'Error: Invalid password'
        });
      }

      // Otherwise correct user
      if (user.userRights === 'admin') {
        User.find({}, (err, arr) => {
          let partners = [];
          for (var i=0; i<arr.length; i++) {
            partners = [arr[i].email, ...partners];
          }
          return res.send({
            success: true,
            token: user._id,
            name: user.name,
            rights: user.userRights,
            partners: partners,
          });
        });
      } else {
        return res.send({
          success: true,
          token: user._id,
          name: user.name,
          rights: user.userRights,
        });
      }
    });
  });

  app.get('/api/data', (req, res, next) => {
    // Get the token
    const { query, body } = req;
    const { token, startDay, endDay, partner } = query;
    let data = [];
    let idSite = '';

    User.find({
      _id: token
    }, (err, users) => {
      if (err) {
        console.log(err);
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }

      if (users.length != 1) {
        return res.send({
          success: false,
          message: 'Error: Invalid'
        });
      } else {
        const user = users[0];
        const daylist = Helpers.getDaysArray(new Date(startDay),new Date(endDay));
        const daysArray = daylist.map((v)=>v.toISOString().slice(0,10));
        let idSite = user.idSite;

        async function getData() {
          const deviceRange = await Promise.all(daysArray.map(d => Helpers.getDevice(d,idSite)));
          const countryRange = await Promise.all(daysArray.map(d => Helpers.getCountry(d,idSite)));

          if (deviceRange.includes(false) || countryRange.includes(false)) {
            return res.send({
              success: false,
              message: 'False includes'
            });
          }
          for (let i=0; i<deviceRange.length; i++) {
            if (deviceRange[i].day = countryRange[i].day) {
              data = [Object.assign(deviceRange[i],countryRange[i]), ...data];
            }
          }
          return res.send({
            success: true,
            data: data,
            priceMob: user.priceMob,
            priceWeb: user.priceWeb,
          });
        }

        if (user.userRights === "admin" && partner !== '') {
          User.find({
            email: partner
          }, (err, usr) => {
            idSite = usr[0].idSite;
            if (!idSite.length) {
              return res.send({
                success: false,
                message: 'False includes'
              });
            }
            getData();
          })
        } else {
          getData();
        }
        // getData();
      }
    });
  });

  app.get('/api/data/all', (req, res, next) => {
    // Get the token
    const { query, body } = req;
    const { token } = query;

    User.find({
      _id: token
    }, (err, users) => {
      if (err) {
        console.log(err);
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }

      if (users.length != 1) {
        return res.send({
          success: false,
          message: 'Error: Invalid'
        });
      } else {
        const user = users[0];
        const { idSite } = user;
        const today = new Date();
        const startDay = user.signUpDate.toISOString().slice(0,10);
        const endDay = today.toISOString().slice(0,10);

        const getData = async function() {
          const summ = await Helpers.getDeviceAllTime(startDay, endDay, idSite);

          if (summ === false) {
            return res.send({
              success: false
            });
          }
          let paidMoney = 0;
          if (user.payList.length) {
            for (let i=0; i<user.payList.length; i++) {
              if (user.payList[i].status === 'Выполнено') {
                paidMoney += user.payList[i].value;
              }
            }
          }
          const allMoney = summ.desk * user.priceWeb + summ.mobile * user.priceMob;
          const accountMoney = allMoney - paidMoney;

          return res.send({
            success: true,
            accountMoney: accountMoney,
          });
        }
        getData();
      }
    });
  });

  app.get('/api/payment', (req, res, next) => {
    // Get the token
    const { query } = req;
    const { token } = query;
    const { partner } = query;

    if (partner == null) {
      User.find({
        _id: token
      }, (err, users) => {
        if (err) {
          console.log(err);
          return res.send({
            success: false,
            message: 'Error: Server error'
          });
        }

        if (users.length != 1) {
          return res.send({
            success: false,
            message: 'Error: Invalid'
          });
        } else {
          const user = users[0];
          res.send({
            success: true,
            payments: user.payList
          })
        }
      });
    } else {
      User.find({
        _id: token
      }, (err, users) => {
        if (err) {
          console.log(err);
          return res.send({
            success: false,
            message: 'Error: Server error'
          });
        }

        if (users.length != 1) {
          return res.send({
            success: false,
            message: 'Error: Invalid'
          });
        } else {
          const user = users[0];
          if (user.userRights === 'admin') {
            User.find({
              email: partner
            }, (err, users) => {
              if (err) {
                console.log(err);
                return res.send({
                  success: false,
                  message: 'Error: Server error'
                });
              }

              if (users.length != 1) {
                return res.send({
                  success: false,
                  message: 'Error: Invalid'
                });
              } else {
                const user = users[0];
                res.send({
                  success: true,
                  payments: user.payList,
                  idSite: user.idSite,
                  partnerName: user.name,
                  priceMob: user.priceMob,
                  priceWeb: user.priceWeb
                })
              }
            });
          } else {
            return res.send({
              success: false,
              message: 'Error: Invalid'
            });
          }
        }
      });
    }
  });

  app.post('/api/payment/new', (req, res, next) => {
    const { body } = req;
    let {
      token,
      data
    } = body;
    User.findOneAndUpdate(
      { _id: token },
      { $push: { payList: data }}, null, (err, doc) => {
      if (err) {
        console.log(err);
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }
      // doc.save();
      return res.send({
        success: true,
        message: 'Good',
      });
    });
  });

  app.put('/api/payment/edit', (req, res, next) => {
    const { body } = req;
    const {
      token,
      data
    } = body;
    const { value, _id, partner } = data;

    User.find({
      _id: token
    }, (err, users) => {
      if (err) {
        console.log(err);
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }

      if (users.length != 1) {
        return res.send({
          success: false,
          message: 'Error: Invalid'
        });
      } else {
        const user = users[0];
        if (user.userRights !== 'admin') {
          return res.send({
            success: false,
            message: 'Error: Invalid'
          });
        } else {
          User.findOneAndUpdate(
            { email: partner },
            { $set: { "payList.$[elem].status" : value } },
            { arrayFilters: [ { "elem._id": { $eq: _id } } ], returnNewDocument : true }, (err, doc) => {
              if (err) {
                console.log(err);
                return res.send({
                  success: false,
                  message: 'Error: Server error'
                });
              }
              // doc.save();
              return res.send({
                success: true,
                message: 'Good',
              });
            });
        }
      }
    });
  });

  app.put('/api/partner/edit', (req, res, next) => {
    const { body } = req;
    const {
      token,
      data,
      partner
    } = body;

    User.find({
      _id: token
    }, (err, users) => {
      if (err) {
        console.log(err);
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }

      if (users.length != 1) {
        return res.send({
          success: false,
          message: 'Error: Invalid'
        });
      } else {
        const user = users[0];
        if (user.userRights !== 'admin') {
          return res.send({
            success: false,
            message: 'Error: Invalid'
          });
        } else {
          User.findOneAndUpdate(
            { email: partner },
            data, null, (err, doc) => {
              if (err) {
                console.log(err);
                return res.send({
                  success: false,
                  message: 'Error: Server error'
                });
              }
              // doc.save();
              return res.send({
                success: true,
                message: 'Good',
              });
            });
        }
      }
    });
  });
};

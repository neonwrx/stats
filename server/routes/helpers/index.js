const axios = require('axios');

const baseUrl = process.env.API_BASE_URL;
const token = process.env.API_TOKEN;

module.exports = {
  getDaysArray: function(s,e) {for(var a=[],d=s;d<=e;d.setDate(d.getDate()+1)){ a.push(new Date(d));}return a;},
  getDeviceAllTime: function(startDay, endDay, idSite) {
    const url = `${baseUrl}?module=API&method=DevicesDetection.getType&idSite=${idSite}&date=${startDay},${endDay}&period=range&format=json&token_auth=${token}`;
    return axios.get(url)
      .then(response => {
        const { data } = response;
        let desk = 0,
            mobile = 0;
        for (var i=0; i<data.length; i++ ) {
          if (data[i].goals !== undefined && data[i].segment === 'deviceType==desktop') {
            desk = data[i].goals['idgoal=1'].nb_conversions;
          } else if (data[i].goals !== undefined && data[i].segment === 'deviceType==smartphone') {
            mobile = data[i].goals['idgoal=1'].nb_conversions;
          }
        }
        return {desk, mobile};
      })
      .catch(error => {
        return false;
      });
  },
  getDevice: function(day, idSite) {
    const url = `${baseUrl}?module=API&method=DevicesDetection.getType&idSite=${idSite}&date=${day}&period=day&format=json&token_auth=${token}`;
    return axios.get(url)
      .then(response => {
        const { data } = response;
        let desk = 0,
            mobile = 0;
        for (var i=0; i<data.length; i++ ) {
          if (data[i].goals !== undefined && data[i].segment === 'deviceType==desktop') {
            desk = data[i].goals['idgoal=1'].nb_conversions;
          } else if (data[i].goals !== undefined && data[i].segment === 'deviceType==smartphone') {
            mobile = data[i].goals['idgoal=1'].nb_conversions;
          }
        }
        return {day, desk, mobile};
      })
      .catch(error => {
        return false;
      });
  },
  getCountry: function(day, idSite) {
    const url = `${baseUrl}?module=API&method=UserCountry.getCountry&idSite=${idSite}&date=${day}&period=day&format=json&token_auth=${token}`;
    return axios.get(url)
      .then(response => {
        const { data } = response;
        let ru = 0,
            other = 0;
        if (data.length > 0) {
          for (var i=0; i<data.length; i++ ) {
            if (data[i].code === 'ru') {
              ru = data[i].nb_uniq_visitors;
            } else {
              other += data[i].nb_uniq_visitors;
            }
          }
        }
        return {day, ru, other};
      })
      .catch(error => {
        return false;
      });
  }
}

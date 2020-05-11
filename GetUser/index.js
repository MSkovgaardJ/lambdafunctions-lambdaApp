const jose = require('jose');
const jwt = jose.JWT;
const fetch = require('node-fetch');
const FormData = require('form-data');

module.exports.handler = async (event) => {
  console.log("Event: ",event)
    let token = JSON.stringify(event.authorizationToken)
    console.log('Token', token)
    getInfo = async(token) => {
      const LambadaUser = await jwt.decode(token)
      const MN = LambadaUser.membership_number;
      const form = new FormData();
      form.append('key',process.env.FA_KEY)
      form.append('secret',process.env.FA_SECRET)
      form.append('memberid',MN)
      console.log('FROM: ', form)
      const user = await fetch(process.env.FA_URL, {
        method:"post",
        body: form
      });
      console.log("User: ", user)
      return user.json();
    }

    return getInfo(token)
      .then(
        user => ({
        statusCode: 200,
        body: JSON.stringify(user)
      }))
      .catch(err => {
        console.log({ err });
  
        return {
          statusCode: err.statusCode || 500,
          headers: { "Content-Type": "text/plain" },
          body: { stack: err.stack, message: err.message }
        };
      });
    };

      

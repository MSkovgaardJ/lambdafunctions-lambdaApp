const AWS = require("aws-sdk");
const axios = require('axios');
const TableName = "LambdaUsers";
const querystring = require('querystring');
// INIT AWS
AWS.config.update({
  region: "eu-north-1"
});

const docClient = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  var memberRes = "";
  if(event.hasOwnProperty('firstName'))
  {
    const member = {
      key: process.env.FA_KEY,
      secret: process.env.FA_SECRET,
      Firstname: event.firstName,
      Middlename: event.middleName,
      Lastname: event.lastName,
      Address: event.address,
      Zip: event.zip,
      City: event.city,
      Email: event.email,
      Mobil: event.mobil_number,
      Phone: event.phone_number,
      ReceiveEmails: event.emails,
      ReceiveSMS: event.sms,
      GenderCode: event.gender,
    }
    memberRes = await axios({
      medthod:'post',
      url: process.env.FA_ENDPOINT,
      headers: {
        'Content-Type': 'multipart/form-data'},       
      data: querystring.stringify(member)
    })
  }
  const user = {
    Item: {
        user_id: uuidv4(),
        email: event.email,
        membership_number: event.membership_number,
        password_hash: event.password
    },
    TableName:TableName
  };
  const userRes = await docClient.put(user).promise();
  

  console.log("UR: ",userRes)
  console.log("MR: ", memberRes)

  return "MR: ", memberRes, "UR: ", userRes
}

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const axios = require('axios');
const querystring = require('querystring');
const TableName = "LambdaUsers";
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
      MemberTypeID: event.membertype,
      ReceiveEmails: event.emails,
      ReceiveSMS: event.sms,
      Birthday: event.birthday,
      GenderCode: event.gender,
      ElektroniskKort: 1
    }
    memberRes = await axios({
      medthod:'post',
      url: process.env.FA_ENDPOINT,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'},       
      form: querystring.stringify(member)
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

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const fetch = require('node-fetch');
var FormData = require('form-data');
const TableName = "LambdaUsers";
// INIT AWS
AWS.config.update({
  region: "eu-north-1"
});

const docClient = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event) => {
  
  getUserInfo = async () => {
  const member = {
    key: process.env.FA_KEY,
    secret: process.env.FA_SECRET,
    memberid: event.membership_number
  }
  var form = new FormData();
  Object.keys(member).forEach((key) => {
    form.append(key,member[key])
  })
console.log("form", form)
  var memberRes = await fetch(process.env.FA_ENDPOINT, {
    method:"post",
    body: form
  });
  console.log("memberinfor", memberRes)
  return memberRes.json();
}
  createUser = async () => {
    var mm = await getUserInfo();
    console.log("mm: ", mm)
    if(mm.resultcode === 0){
      console.log("member exists")
      if(mm.resultdata.member.Email === event.email)
      {
        console.log("email exists")
        const user = {
          Item: {
              user_id: uuidv4(),
              email: event.email,
              membership_number: event.membership_number,
              password_hash: event.password
          },
          TableName:TableName
        };
        const userRes = await docClient.put(user);
        return {
          statusCode: 200,
          body:"Bruger oprettet" + userRes
        }
      } else {
        return {
          statusCode: 404,
          body:"Medlems nummer findes men har ikke denne email"
        }
      } 
    } else {
      return {
      statusCode: 404,
      body:"Medlems nummer findes ikke"
    }
  }
}

  return createUser()
  .then(
    userRes => ({
    statusCode: userRes.statusCode,
    body: JSON.stringify(userRes)
  }))
  .catch(err => {
    console.log({ err });

    return {
      statusCode: err.statusCode || 500,
      headers: { "Content-Type": "text/plain" },
      body: { stack: err.stack, message: err.message }
    };
  });
}

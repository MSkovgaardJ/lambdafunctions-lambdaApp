const AWS = require("aws-sdk");
const fetch = require('node-fetch');
const { v4: uuidv4 } = require("uuid");
var FormData = require('form-data');
const TableName = "LambdaUsers";

AWS.config.update({
    region: "eu-north-1"
  });

const docClient = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
    const createMember = async () => {
    const user = {
        Item: {
            user_id: uuidv4(),
            email: event.email,
            membership_number: 0,
            password_hash: event.password
        },
        TableName:TableName
        };
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
    var form = new FormData();
    Object.keys(member).forEach((key) => {
    form.append(key,member[key])
    })
    console.log("form", form)
    var memberRes = await fetch(process.env.FA_ENDPOINT, {
    method:"post",
    body: form
    });
    console.log("MR", memberRes)
    const userRes = await docClient.put(user);
    console.log("UR: ", userRes)
        return {
          statusCode: 200,
          body:"Bruger oprettet" + userRes.json() + memberRes.json()
        }
}
    return createMember()
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
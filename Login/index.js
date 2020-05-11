const AWS = require("aws-sdk");
const jose = require('jose');
const jwt = jose.JWT;
const bcrypt = require("bcryptjs");

const docClient = new AWS.DynamoDB.DocumentClient();

const getUserByMN = async membership_number => {
  const params = {
    TableName:"LambdaUsers",
    FilterExpression: "#mn = :mn",
    ExpressionAttributeNames: {
        "#mn": "membership_number",
    },
    ExpressionAttributeValues: {
        ":mn": membership_number
    }
};
  const res = await docClient.scan(params).promise();
  if(res.Count === 0)
  {
      return "failed";
  } else {
      return res;
      }
};
const getUserByEmail = async email => {
  const params = {
    TableName:"LambdaUsers",
    FilterExpression: "#email = :email",
    ExpressionAttributeNames: {
        "#email": "email",
    },
    ExpressionAttributeValues: {
        ":email": email
    }
};
  const res = await docClient.scan(params).promise();
  if(res.Count === 0)
  {
      return "failed";
  } else {
      return res;
      
  }
}

function comparePassword(eventPassword, userPassword) {
  if(eventPassword === userPassword)
  {return true}
  else if(bcrypt.compare(eventPassword, userPassword)) {
    return true
  } 
  else {
    return false
  }
}

async function signToken(user) {
  const secret = process.env.JWT_SECRET;
  console.log(secret);
  return jwt.sign({ email: user.email, user_id: user.user_id, membership_number: user.membership_number }, secret, {
    expiresIn: "12 hours" // expires in 12 hours
  });
}

module.exports.handler = async (event) => {
  try {
    let users = "";
    if(event.hasOwnProperty('membership_number'))
    {
      users = await getUserByMN(event.membership_number);
      
    } else if(event.hasOwnProperty('email'))
    {
      users = await getUserByEmail(event.email)
    } else {
        console.log("Shit's broke")
    }
    
    const user = users.Items[0]
    const isValidPassword = await comparePassword(
      event.password_hash,
      user.password_hash
    );
    console.log("Isvalid: ",isValidPassword)
    if (isValidPassword) {
      const token = await signToken(user);
      return Promise.resolve({ auth: true, token: token, status: "SUCCESS" });
    }
  } catch (err) {
    console.log("fail")
    console.log("Error login", err);
    return Promise.reject(new Error(err));
  }
}

function comparePassword(eventPassword, userPassword) {
  if(eventPassword === userPassword)
  {return true}
  else if(bcrypt.compare(eventPassword, userPassword)) {
    return true
  } 
  else {
    return false
  }
}

async function signToken(user) {
  const secret = process.env.JWT_SECRET;
  console.log(secret);
  return jwt.sign({ email: user.email, user_id: user.user_id, membership_number: user.membership_number }, secret, {
    expiresIn: "12 hours" // expires in 12 hours
  });
}
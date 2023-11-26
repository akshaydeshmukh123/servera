// ! user Router for air Ticket Booking

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const UserModel = require("../models/User.Model");


const UserRouter = express.Router();
UserRouter.use(express.json());

//! USER'S REGISTRATION

//Register  routes
UserRouter.post("/register", async (req, res) => {
  //destructuring data from req body
  const { name, email, password } = req.body;
  console.log(req.body);
  try {
    //finding existing user if present or not by its email
    const user = await UserModel.find({ email });
    console.log(user);
    // if the user is already present  i.e register then
    if (user.length > 0) {
      res.send(
        `USER ALREADY REGISTERED YOU CAN LOGIN DIRECTLY THANK YOU SO MUCH FOR VISITING HERE`
      );
    }
    // if the user is not registered then creating a new user
    else {
      // first hashing the password for security purposes

      bcrypt.hash(password, 7, async function (err, hash) {
        //  creating users with the help of model of user

        const users = new UserModel({
          name,
          email: email,
          password: hash,
        });
        console.log(users);
        // saving the user's data in our mongodb database

        await users.save();

        res
          .status(201)
          .send({
            message: `USER SUCCESSFUL REGISTERED `,
          });
      });
    }
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

// ! USER 'S LOGIN

// Login Router

UserRouter.post("/login", async (req, res) => {
  // destructuring email and password from schema
  const { email, password } = req.body;
  console.log(req.body);

  try {
    //  finding user by its email

    const user = await UserModel.findOne({ email });
    console.log(user);

    // used the hashed password
    const hashed_password = user?.password;
    console.log(hashed_password);

    //  if the user is matched with registered details then comparing the details
    if (user) {
      bcrypt.compare(password, hashed_password, async function (err, result) {
        // if the result is true then
        if (result) {
          // we generate a token for authentication purposes with the expiry timeline and secret key
          const token = jwt.sign({ user_id: user._id }, "secret_key", );
          console.log(token);

          //  if respond is correct then send the login successful message
          res.send({
            token,
            message: `USER SUCCESSFULLY LOGIN `,
              user_id: user._id,
              auth:1
            
          });
        } else {
          console.log(err.message);
        }
      });
    } else {
      // Otherwise we send the login failed message
      console.log(
        `SORRY USER NOT FOUND CAN YOU REGISTER AGAIN OR CHECK YOUR DETAILS`
      );
      res
        .status(404)
        .send({
            message: `SORRY PASSWORD MISSMATCHED  ☹️ OR CHECK YOUR DETAILS`,
            auth:-1
        });
    }
  } catch (error) {
    // if error is comimg in login then send login failed message
    console.log({ error: error.message });
    res
      .status(404)
      .send({ message: `ERROR ☹️ IN LOGIN THE USERS : ${error.message}`, auth:0 });
  }
});

// exporting router of user of using in index file
module.exports = UserRouter;

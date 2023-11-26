const express = require("express");
const { connection } = require("./config/db");
const UserRouter = require("./router/User.Router");


const cors=require("cors")

const FileRouter=require("./router/File.Router")

const  auth = require("./middleware/auth");
const app = express();

app.use(cors())

app.use("/", UserRouter);


app.get("/", async (req, res) => {
  try {
    res.send(`database`);
  } catch (error) {
    console.log(error.message);
  }
});

app.use(express.urlencoded({ extended: false }));

app.use("/", FileRouter);
app.use("/", auth);


app.use(express.json());


//connection to the server


app.listen(process.env.port, async () => {
  try {
    await connection;
    console.log(`app listening on port ${process.env.port}`);
  } catch (error) {
    console.log({
      error: `error in connections with the  port: ${error.message}`,
    });
  }
});

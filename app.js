const express = require("express");
const graphqlHTTP = require("express-graphql");
const schema = require("./schema/schema");
const mongoose = require("mongoose");
const app = express();
var socket = require("socket.io");

mongoose.connect(
  "mongodb://dbUser:dbpass@learning-cluster-shard-00-00-gv442.mongodb.net:27017,learning-cluster-shard-00-01-gv442.mongodb.net:27017,learning-cluster-shard-00-02-gv442.mongodb.net:27017/test?ssl=true&replicaSet=learning-cluster-shard-0&authSource=admin&retryWrites=true&w=majority",
  {
    useNewUrlParser: true
  }
);

mongoose.connection.once("open", () => {
  console.log("connected to mongo atlas database");
});
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true
  })
);
var server = app.listen(4000, () => {
  console.log("connected to 4000");
});

var io = socket(server);
var count = 0;
io.on("connection", function(socket) {
  if (socket && socket.id) {
    console.log("made socket connection");
  }

  socket.on("delete", function(data) {
    count++;
    console.log(count);
    if (data) {
      socket.broadcast.emit("refetch", data);
    }
  });

  socket.on("add", function(data) {
    count++;
    console.log(count);
    if (data) {
      socket.broadcast.emit("refetch", data);
    }
  });
  // socket.on('typing', function(data){
  //     socket.broadcast.emit('typing', data)
  // })
});

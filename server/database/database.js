const mongoose = require('mongoose');

const connection = mongoose.createConnection("mongodb+srv://admin:admin123@cluster0.1p32kbc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").on("open", ()=>{
  console.log("Database Connected");
});

module.exports = connection
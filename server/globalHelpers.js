const mongoose = require('mongoose');
console.log('---->>>>222', process.env.MONGODB_URI);
mongoose.connect(
  'mongodb+srv://quickdukanprod:quickdukan%40bitashutosh@cluster0.5slcr.mongodb.net/lexify?authSource=admin&replicaSet=atlas-7kncey-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }
);

// mongoose.set("debug", true);
mongoose.connection.on('connected', function() {
  console.log('database connected');
});
// Event when there is an error connecting for database
mongoose.connection.on('error', function(err) {
  console.log(22, err);
});

global.connection = mongoose.connection;

module.exports = {};

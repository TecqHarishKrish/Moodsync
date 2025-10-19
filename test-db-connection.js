const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB connection...');
console.log('Connection string (password hidden):', 
  process.env.MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')
);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully!');
  console.log('Database:', mongoose.connection.db.databaseName);
  console.log('Host:', mongoose.connection.host);
  process.exit(0);
})
.catch((error) => {
  console.error('❌ MongoDB Connection Failed:');
  console.error('Error:', error.message);
  console.error('\nPossible solutions:');
  console.error('1. Check if your password contains special characters that need URL encoding');
  console.error('2. Verify your IP address (27.61.63.75) is whitelisted in MongoDB Atlas');
  console.error('3. Ensure the database user has proper permissions');
  console.error('4. Check if the cluster is running in MongoDB Atlas');
  process.exit(1);
});

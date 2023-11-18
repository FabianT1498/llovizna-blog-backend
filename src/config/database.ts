import mongoose from 'mongoose';

const { DATABASE_URL } = process.env;

const connect = () => {
  // Connecting to the database
  return new Promise((resolve, reject) => {
    mongoose
      .connect(DATABASE_URL || '')
      .then(() => {
        console.log('Successfully connected to database');
        resolve('Database connected');
      })
      .catch((err) => {
        console.log('database connection failed. exiting now...');
        reject(err);
      });
  });
};

export default connect;

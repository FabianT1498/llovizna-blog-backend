import mongoose from 'mongoose';

import { app } from './app';

// DATABASE
import connect from './config/database';

const port = 3000;

// DATABASE SETUP
connect()
  .then((message) => console.log(message))
  .catch((err) => {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  });

app.listen(port, () => {
  console.log(`[Server]: I am running at http://localhost:${port}`);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT. Exiting...');
  mongoose
    .disconnect()
    .then((res) => process.exit(0))
    .catch((err) => process.exit(0));
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Exiting...');
  mongoose
    .disconnect()
    .then((res) => process.exit(0))
    .catch((err) => process.exit(0));
});

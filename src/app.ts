import * as express from 'express';
import * as dotenv from 'dotenv';

// MIDDLEWARES
import { configureGlobal } from './middleware/configureGlobal';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

dotenv.config();

// ROUTES
import authRouter from './routes/authRoutes';
// import userRouter from './routes/userRoutes';
// import postRouter from './routes/postRoutes';

const app = express();

// GLOBAL MIDDLEWARES
configureGlobal(app);

// ROUTES
app.use('/auth', authRouter);
// app.use('/api/v1/users', userRouter);
// app.use('/api/v1/posts', postRouter);

// ERROR HANDLER MIDDLEWARES
errorHandler(app);
notFound(app);

export { app };

import * as nodemailer from 'nodemailer';

const {
  NODEMAILER_SERVICE,
  NODEMAILER_HOST,
  NODEMAILER_PORT,
  NODEMAILER_SECURE,
  NODEMAILER_AUTH_USER,
  NODEMAILER_AUTH_PASSWORD,
} = process.env;

const port: number = NODEMAILER_PORT ? parseInt(NODEMAILER_PORT) : 587;

const secure: boolean = NODEMAILER_SECURE ? (NODEMAILER_PORT === 'true' ? true : false) : false;

const config = {
  service: NODEMAILER_SERVICE,
  host: NODEMAILER_HOST,
  port,
  secure,
  auth: {
    user: NODEMAILER_AUTH_USER,
    pass: NODEMAILER_AUTH_PASSWORD,
  },
};

const send = (data: any): Promise<any> => {
  const transporter = nodemailer.createTransport(config);
  return transporter.sendMail(data);
};

export { send };

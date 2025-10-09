import pkg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("./ca-certificate.crt").toString()
  }
});

export default pool;

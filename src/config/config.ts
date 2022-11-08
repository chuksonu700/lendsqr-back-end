import dotenv from 'dotenv';

dotenv.config();
let mysqlConnection: any;

if (process.env.NODE_ENV === "production") {
  mysqlConnection = {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    }
  }
} else {
  mysqlConnection = {
    client: 'mysql2',
    connection: {
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'lendsqr'
    }
  }
}

export default mysqlConnection;
import mysql from "mysql2";

// From https://www.npmjs.com/package/mysql2
// Create the connection pool. The pool-specific settings are the defaults
export const pool = mysql.createPool({
  host: 'localhost',
  user: 'test_user',
  password: 'password',
  database: 'fa',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});
// End copyrighted material

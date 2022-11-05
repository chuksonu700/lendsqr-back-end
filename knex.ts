import { config } from "./config/config";

const knex = require('knex')({
    client: 'mysql2',
    connection: {
      host : config.host,
      port : config.port,
      user : config.username,
      password : config.password,
      database : config.name
    }
});

export default knex;
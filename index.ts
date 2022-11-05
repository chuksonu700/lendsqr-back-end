import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import knex from './knex';


dotenv.config();

knex.raw("SELECT VERSION()").then(
  (version: any[][]) => console.log((version[0][0]))
).catch((err: any) => { console.log( err); throw err })
  .finally(() => {
      knex.destroy();
  });

const app: Express = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server Thanks');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
})
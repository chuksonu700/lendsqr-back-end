import app from './app';

import { ENV } from './config';
//seting Port using Enviroment Variable
const port = ENV.port || 8000

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at ${port}`);
})
//setting up heroku
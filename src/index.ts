import dotenv from 'dotenv';
import app from './app';


//configuring enviroment Variables
dotenv.config();

//seting Port using Enviroment Variable
const port = process.env.PORT || 8000

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at ${port}`);
})
//setting up heroku
import express, { application } from 'express';
import cors from 'cors';

import userRouters from "./routes/user.routes.js"
import transitionsRouters from "./routes/transitions.routes.js"

const app = express();


app.use(cors());
app.use(express.json());

app.use(userRouters);
app.use(transitionsRouters);

app.listen(5000, ()=> console.log("server running in port 5000"));

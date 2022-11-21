import express, { application } from 'express';
import cors from 'cors';
import joi from 'joi';

import userRouters from "./routes/user.routes.js"
import transitionsRouters from "./routes/transitions.routes.js"

export const userSchema = joi.object({
    name: joi.string().required().min(3).max(100),
    password: joi.string().required(),
    email: joi.string().email().required(),
    check: joi.string().required()
})
export const transationsSchema = joi.object({
    value: joi.string().required().min(1),
    description: joi.string().required().min(1),
})

const app = express();


app.use(cors());
app.use(express.json());

app.use(userRouters);
app.use(transitionsRouters);

app.listen(5000, ()=> console.log("server running in port 5000"));

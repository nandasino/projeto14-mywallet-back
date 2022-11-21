import express, { application } from 'express';
import cors from 'cors';
import joi from 'joi';


import { postCadastro, postLogin } from './controllers/user.controller.js';
import { getCarteira, postEntrada, postSaida } from './controllers/transitions.controller.js';

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

app.post("/cadastro", postCadastro)

app.post("/", postLogin);

app.get("/carteira", getCarteira)

app.post("/entrada", postEntrada )

app.post("/saida", postSaida)

app.listen(5000, ()=> console.log("server running in port 5000"));

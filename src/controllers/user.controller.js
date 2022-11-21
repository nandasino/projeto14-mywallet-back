import {userSchema} from "../index.js"
import bcrypt from 'bcrypt';
import {v4 as uuidV4} from 'uuid';
import {userCollection, sessionsCollection} from "../database/db.js"

async function postCadastro(req,res){
    const user = req.body;

    try{
        const userExists = await userCollection.findOne({
            email: user.email
        });

        if(userExists){
            return res.sendStatus(401).send({message: "Esse e-mail já é cadastrado!"});
        }

        const {error} = userSchema.validate(user, {abortEarly: false});

        if(error){
        const errors = error.details.map(detail=> detail.message);
        return res.status(400).send(errors);
        }

        if(user.password!== user.check){
            return res.sendStatus(401).send({message: "senhas diferentes"});
        }

        const hashPassword = bcrypt.hashSync(user.password, 10);
        delete user.check;

        await userCollection.insertOne({...user, password : hashPassword});
        res.sendStatus(201);

    }catch(err){
        res.status(500).send(err);
    }
}

async function postLogin(req, res){
    const { email, password } = req.body;

    const token = uuidV4();

    try{
        const userExists = await userCollection.findOne({ email });
        if(!userExists){
            return res.sendStatus(401).send({message: "E-mail não cadastrado"})
        }
    
        const samePassword = bcrypt.compareSync(password, userExists.password)

        if(!samePassword){
            return res.sendStatus(401).send({message: "Senha incorreta"})
        }

        const session = {
            token,
            userId: userExists._id,
            name: userExists.name,
        }

        await sessionsCollection.insertOne(session)
        
        res.send(session)
    }catch(err){
        res.sendStatus(500).send(err);
    }
}

export{
    postCadastro,
    postLogin
}
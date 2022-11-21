import { postCadastro, postLogin } from '../controllers/user.controller.js';
import {Router} from 'express';

const router = Router();

router.post("/cadastro", postCadastro)

router.post("/", postLogin);

export default router;
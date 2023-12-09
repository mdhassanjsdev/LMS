require('dotenv').config();
import express, { Application, NextFunction, Request, Response } from 'express'
import http from "http";
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { rateLimit } from 'express-rate-limit'
import connect_db from './db/mongoose';
import MainRouter from './routes/Routes'
import { errohandle } from './middleware/errorHandler.middleware';
import { v2 as cloudinary } from 'cloudinary';


const app: Application = express()
const server = http.createServer(app)
const PORT: string | number = process.env.PORT || 4000
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
})
connect_db()


app.use(express.json({ limit: '50mb' }))
app.use(cookieParser())
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}))
app.use(limiter)
app.use('/api/v1', MainRouter)
app.use(errohandle)


app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.send('api is working')
    next()
})



cloudinary.config({
    cloud_name: 'dsqcfcmi3',
    api_key: '665468261999489',
    api_secret: '1ZpJeTzf1UCXmfEu8k3G-C3225E'
});

server.listen(PORT, () => {
    console.log(`server run at http://localhost:${PORT}`);
})
require('dotenv').config();

import nodemailer, { Transporter } from 'nodemailer'
import ejs from 'ejs'
import path from 'path'
import { EmailOptions } from '../types'

const sendMail = async (options: EmailOptions): Promise<void> => {
    const transporter: Transporter = nodemailer.createTransport({
        host: process.env.SMPT_HOST,
        port: parseInt(process.env.SMPT_PORT || '587'),
        service: process.env.SMPT_SERVICES,
        auth: {
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASSWORD
        },
    });
    const { email, subject, template, data } = options;


    // dynamic template 
    const templatePath = path.join(process.cwd(), 'mail', template);

    // render emial template 
    const html: string = await ejs.renderFile(templatePath, data);

    // send mail 

    const mailOptions = {
        from: process.env.SMPT_MAIL,
        to: email,
        subject,
        html
    };

    await transporter.sendMail(mailOptions)
};

export default sendMail
import * as nodemailer from 'nodemailer'

import { Injectable } from "@nestjs/common";

@Injectable()

export class Email {
    //manejar con variables de entorno.
    transporter = nodemailer.createTransport({
        host: process.env.HOST_EMAIL,
        port: process.env.PORT_EMAIL,
        secure: true,
        auth: {
            user: process.env.MAIl_USER,
            pass: process.env.MAIl_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    async sendEmail(from, subjectEmail, sendTo, html) {
        try {
            const info = await this.transporter.sendMail({
                from: from, // sender address
                to: sendTo, // list of receivers
                subject: subjectEmail, // Subject line
                // text: "Hello world?", // plain text body
                html: html, // html body
            });
            console.log("Message sent: %s", info.messageId);
        } catch (error) {
            console.log(error)
            throw error

        }

    }
}
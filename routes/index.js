const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const request = require("request");

const Item = require("../models/Item");

const router = express.Router();

router.get("/", (req, res) => {
    res.redirect("/articulos");
});

router.get("/articulos", async (req, res) => {
    const items = await Item.find({ status: "public" }).lean();

    res.render("items", { items: items.reverse(), main: "active" });
});

router.get("/nosotros", (req, res) => {
    res.render("about", { us: "active" });
});

router.get("/contactanos", (req, res) => {
    res.render("contact", { contact: "active" });
});

router.post("/email", (req, res) => {
    const captcha = req.body.captcha || req.body["g-recaptcha-response"];

    if (captcha == undefined || captcha == "" || captcha == null) {
        return res.json({
            success: false,
            msg: "Porfavor completar el captcha",
        });
    }

    // Secret key
    const captchaSecretKey = process.env.CAPTCHA_SECRET_KEY;

    // Verify URL
    const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${captchaSecretKey}&response=${captcha}&remoteip${req.connection.remoteAddress}`;

    // Make request to verify URL
    request(verifyUrl, (err, response, body) => {
        body = JSON.parse(body);

        // If not successful
        if (body.success !== undefined && !body.success) {
            return res.json({ success: false, msg: "Captcha fallado" });
        }

        // If successful
        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "pranaemailer@gmail.com",
                    pass: "plo.301.as",
                },
            });

            const mailOptions = {
                from: "pranaemailer@gmail.com",
                to: "decorprana@gmail.com",
                subject: `Mensaje de ${req.body.name}`,
                text: `Nombre: ${req.body.name}, \nNumero: ${req.body.number}, \n\nMensaje: ${req.body.message}`,
            };

            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.error(err);
                    return res.json({
                        success: false,
                        msg: "Perdon, hubo un error",
                    });
                }
            });

            return res.json({ success: true, msg: "Mensaje Enviado!" });
        } catch (error) {
            return res.json({ success: false, msg: "Perdon, hubo un error" });
        }
    });
});

module.exports = router;

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const methodOverride = require("method-override");
const basicAuth = require("express-basic-auth");

const Item = require("../models/Item");

const router = express.Router();

// Authentification
router.use(
    basicAuth({
        users: { admin: process.env.ADMIN_PASSWORD },
        challenge: true,
    })
);

// Set storage engine
const storage = multer.diskStorage({
    destination: "./public/images/uploads/",
    filename: function (req, file, callback) {
        callback(
            null,
            file.fieldname +
                "-" +
                Date.now()
                    .toString()
                    .replace(/[-T:\.Z]/g, "") +
                path.extname(file.originalname)
        );
    },
});

// Init Upload
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        //Checking to see if the file is an image

        //Allowed extensions
        const fileTypes = /jpeg|jpg|png|gif/;

        //Check extension
        const extname = fileTypes.test(
            path.extname(file.originalname).toLocaleLowerCase()
        );

        //Check MIME type
        const mimeType = fileTypes.test(file.mimetype);

        if (mimeType && extname) {
            return callback(null, true);
        } else {
            callback("Error, solo imagenes");
        }
    },
});

// Method Override
router.use(
    methodOverride(function (req, res) {
        const isEmpty = (obj) => {
            return Object.keys(obj).length === 0 && obj.constructor === Object;
        };

        if (req.method == "POST" && isEmpty(req.body)) {
            if (
                req.get("Content-Type").split(";")[0] == "multipart/form-data"
            ) {
                req.isForm = true;
            }
        } else {
            if (
                req.body &&
                typeof req.body === "object" &&
                "_method" in req.body
            ) {
                // look in urlencoded POST bodies and delete it
                let method = req.body._method;
                delete req.body._method;
                return method;
            }
        }
    })
);

router.use(function (req, res, next) {
    if (req.isForm) {
        req.isForm = null;

        try {
            upload.single("image")(req, res, async (err) => {
                if (err) {
                    try {
                        if (
                            req.url.split("/")[0] == "" &&
                            req.url.split("/")[1] == ""
                        ) {
                            req.flash("itemErr", err);

                            return res.redirect("/admin/agregar");
                        } else {
                            if (req.session.itemId) {
                                const itemId = req.session.itemId;
                                req.session.itemId = null;
                                req.flash("editErr", err);
                                return res.redirect(
                                    `/admin/editar/${req.session.itemId}`
                                );
                            } else {
                                return res.render("error/404", {
                                    layout: "admin",
                                });
                            }
                        }
                    } catch (error) {
                        console.log(error);
                        return res.render("error/500", { layout: "admin" });
                    }
                }

                req.isProcessed = true;
                next();
            });
        } catch (error) {
            console.error(error);
            return res.render("error/500", { layout: "admin" });
        }
    } else {
        next();
    }
});

router.use(function (req, res, next) {
    if (req.isProcessed) {
        req.isProcessed = null;

        methodOverride(function (req, res) {
            if (
                req.body &&
                typeof req.body === "object" &&
                "_method" in req.body
            ) {
                // look in urlencoded POST bodies and delete it
                let method = req.body._method;
                delete req.body._method;
                return method;
            }
        })(req, res, next);
    } else {
        next();
    }
});

// ROUTES

router.get("/", async (req, res) => {
    res.redirect("/admin/articulos");
});

router.get("/articulos", async (req, res) => {
    try {
        const items = await Item.find({}).lean();

        res.render("admin/items", {
            layout: "admin",
            items: items,
        });
    } catch (error) {
        console.log(error);
    }
});

router.get("/agregar", (req, res) => {
    res.render("admin/add", {
        layout: "admin",
        error: req.flash("itemErr")[0],
    });
});

router.get("/editar/:id", async (req, res) => {
    if (!req.params.id) {
        return res.render("error/404", { layout: "admin" });
    }

    try {
        const item = await Item.findById(
            mongoose.Types.ObjectId(req.params.id)
        ).lean();

        req.session.itemId = item._id;

        res.render("admin/edit", {
            layout: "admin",
            error: req.flash("editError"),
            item: item,
        });
    } catch (error) {
        console.error(error);
        res.render("error/404", { layout: "admin" });
    }
});

router.post("/", async (req, res) => {
    try {
        let requestBody = req.body;

        let requestObjects = {};

        for (let item in requestBody) {
            let obj = requestBody[item];
            if (typeof obj == "object") {
                requestObjects[item] = { ...obj };
            }
        }

        let detailsList = [];

        for (let key in requestObjects) {
            const el = requestObjects[key];
            if (typeof el === "object") {
                let isMissing = false;
                for (let item in el) {
                    let obj = el[item];
                    if (obj == "") {
                        isMissing = true;
                    }
                }
                if (!isMissing) {
                    delete requestBody[key];
                    detailsList.push({ ...el });
                } else {
                    delete requestBody[key];
                }
            }
        }
        requestBody.details = detailsList;

        if (req.file === undefined) {
            requestBody.image = "/images/default.png";

            let newItem = requestBody;

            try {
                await Item.create(newItem);
                res.redirect("/admin");
            } catch (error) {
                console.error(error);
                res.render("error/500", { layout: "admin" });
            }
        } else {
            try {
                const image = await sharp(
                    `./public/images/uploads/${req.file.filename}`
                )
                    .resize(500, 500)
                    .png()
                    .toBuffer();
                fs.writeFileSync(
                    `./public/images/uploads/${req.file.filename}`,
                    image
                );

                requestBody.image = `/images/uploads/${req.file.filename}`;
            } catch (err) {
                console.error(err);

                try {
                    const imgPath = path.join(
                        __dirname,
                        `../public/images/uploads/${req.file.filename}`
                    );

                    fs.unlinkSync(imgPath, (err) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                } catch (error) {
                    console.error(error);
                }

                requestBody.image = "/images/default.png";
            }

            let newItem = requestBody;

            try {
                await Item.create(newItem);
                res.redirect("/admin");
            } catch (error) {
                console.error(error);

                try {
                    const imgPath = path.join(
                        __dirname,
                        `../public/images/uploads/${req.file.filename}`
                    );

                    fs.unlinkSync(imgPath, (err) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                } catch (err) {
                    console.error(err);
                }

                res.render("error/500", { layout: "admin" });
            }
        }
    } catch (err) {
        console.error(err);
        res.render("error/500", { layout: "admin" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        let existingItem = await Item.findById(
            mongoose.Types.ObjectId(req.params.id)
        ).lean();

        let requestObjects = {};

        for (let item in req.body) {
            let obj = req.body[item];
            if (typeof obj == "object") {
                requestObjects[item] = { ...obj };
            }
        }

        let detailsList = [];

        for (let key in requestObjects) {
            const el = requestObjects[key];
            if (typeof el === "object") {
                let isMissing = false;
                for (let item in el) {
                    let obj = el[item];
                    if (obj == "") {
                        isMissing = true;
                    }
                }
                if (!isMissing) {
                    delete req.body[key];
                    detailsList.push({ ...el });
                } else {
                    delete req.body[key];
                }
            }
        }

        req.body.details = detailsList;

        if (req.body.noNewImage === "true" && req.file == undefined) {
            delete req.body.noNewImage;

            let newItem = req.body;

            try {
                existingItem = await Item.findOneAndUpdate(
                    { _id: existingItem._id },
                    newItem,
                    { new: true, runValidators: true }
                );
                res.redirect("/admin");
            } catch (error) {
                console.error(error);
                res.render("error/500", { layout: "admin" });
            }
        } else if (req.body.noNewImage === "false" && req.file) {
            if (existingItem.image != "/images/default.png") {
                try {
                    const image = await sharp(
                        `./public/images/uploads/${req.file.filename}`
                    )
                        .resize(500, 500)
                        .png()
                        .toBuffer();
                    fs.writeFileSync(
                        `./public/images/uploads/${req.file.filename}`,
                        image
                    );

                    req.body.image = `/images/uploads/${req.file.filename}`;

                    const imgPath = path.join(
                        __dirname,
                        `../public${existingItem.image}`
                    );

                    fs.unlinkSync(imgPath, (err) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                } catch (err) {
                    console.error(err);

                    try {
                        const imgPath = path.join(
                            __dirname,
                            `../public/images/uploads/${req.file.filename}`
                        );

                        fs.unlinkSync(imgPath, (error) => {
                            if (error) {
                                console.error(error);
                            }
                        });
                    } catch (error) {
                        console.error(error);
                    }

                    req.body.image = "/images/default.png";
                }
            }

            delete req.body.noNewImage;

            let newItem = req.body;

            try {
                existingItem = await Item.findOneAndUpdate(
                    { _id: existingItem._id },
                    newItem,
                    { new: true, runValidators: true }
                );
                res.redirect("/admin");
            } catch (error) {
                console.error(error);

                try {
                    const imgPath = path.join(
                        __dirname,
                        `../public/images/uploads/${req.file.filename}`
                    );

                    fs.unlinkSync(imgPath, (err) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                } catch (err) {
                    console.error(err);
                }

                res.render("error/500", { layout: "admin" });
            }
        } //else ???????------------------------------------------------------------------------------:
    } catch (err) {
        console.error(err);
        res.render("error/500", { layout: "admin" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const item = await Item.findById(
            mongoose.Types.ObjectId(req.params.id)
        ).lean();

        if (item.image != "/images/default.png") {
            try {
                const imgPath = path.join(__dirname, `../public${item.image}`);

                fs.unlinkSync(imgPath, (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }

        await Item.deleteOne({ _id: item._id });
        res.redirect("/admin");
    } catch (error) {
        console.error(error);
        res.render("error/500", { layout: "admin" });
    }
});

module.exports = router;

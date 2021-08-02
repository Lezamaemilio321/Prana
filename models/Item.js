const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    details: {
        type: Array,
    },
    status: {
        type: String,
        default: "public",
        enum: ["public", "private"],
    },
    category: {
        type: String,
	default: "otros"
    },
    image: {
        type: String,
        default: null,
    }
});

module.exports = mongoose.model("Item", ItemSchema);

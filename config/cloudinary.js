const {v2: cloudinary } = require('cloudinary');

require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.ALVO_CLOUD_NAME,
    api_key: process.env.ALVO_API_KEY,
    api_secret: process.env.ALVO_API_SECRET
});

module.exports = cloudinary;
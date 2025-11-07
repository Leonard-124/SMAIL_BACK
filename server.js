
const express = require('express');
const morgan = require('morgan')
const dotenv = require("dotenv")
const itemRoute = require("./routes/itemRoutes.js")
const authRoutes = require("./routes/authRoute.js")

const app = express();
dotenv.config()

const PORT = process.env.PORT || 4000;

app.use(express.json())
app.use(morgan('dev'))
app.use("/api/v1", itemRoute);
app.use("/api/v1/auth", authRoutes);


app.get("/", (req, res) => {
    res.send("Welcome to SMAIL")
})

app.listen(PORT, ()=>{
    
    console.log(`Server is running on http://localhost:${PORT}`)
});
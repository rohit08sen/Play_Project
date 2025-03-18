import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";



const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  Credential:true
}))

//data can come from in any from any where that's why--->

app.use(express.json({ limit: "16kb" }))//forms se data aya json form se
app.use(express.urlencoded({ extended: true, limit: "16kb" }));//url se data aye to like jaise space ka value url mein %20 hot hai to usko encode karna padega
app.use(express.static("public"))//kuch bhi file photo aya to file mein dal do
app.use(cookieParser())




export {app}
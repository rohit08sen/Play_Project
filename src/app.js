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
app.use(express.static("public"))//kuch bhi file css photo aya to file mein dal do
app.use(cookieParser())

//routes import
import userRouter from './routes/user.routes.js'


//routes declaration
app.use("/api/v1/users", userRouter)///api/v1 standard writing
/*http://localhost:8000/api/v1users--->it will direct to userRouter then if we put "/users/register" it will goto register method*/






export {app}
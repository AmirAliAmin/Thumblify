import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', ()=>{
            console.log("Database Connected")
        })
        await mongoose.connect(process.env.MONGOOSE_URL as string)
    } catch (error) {
        console.log("Connection error",error)
    }
}

export default connectDB;
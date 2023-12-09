import mongoose from "mongoose";

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/lms-system'

const connect_db = async () => {
    try {
        await mongoose.connect(DB_URL).then((data: any) => {
            console.log(`database connected on ${data.connection.host}`);
        })
    } catch (error: any) {
        console.log(error.message);
        setTimeout(connect_db, 5000)
    }
}

export default connect_db
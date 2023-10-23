import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import groupbyOrganisation from "./utils/stages/groupbyOrganisation"
import lookupOrganisation from "./utils/stages/lookupOrganisation"
import projectFields from "./utils/stages/projectFields"
import { PSS } from "./schemas/PSSSchema"
import { PSSDenormalized } from "./schemas/PSSDenormalized"

const PORT = process.env.PORT || 3000

const app = express()

app.use(cors())

mongoose.connect(process.env.MONGO_URI ?? "")

const connection = mongoose.connection

connection.once("open", () => {
    console.log(`Connected to MongoDB: ${process.env.MONGO_URI}`)
})

connection.on("error", (err) => {
    console.error(`Connection error: ${err}`)
})

app.get("/api", async (req, res) => {
	const aggregation: any = [groupbyOrganisation(), lookupOrganisation(), projectFields()].flat(2)
	try {
		const results = await PSS.aggregate(aggregation).exec();
		await PSSDenormalized.deleteMany({})
		await PSSDenormalized.insertMany(results)
		return res.status(200).json(results)
	} catch (err) {
		return res.status(500).json(err)
	}
})

app.listen(PORT, () => {
	console.log(`Server is running on ${PORT}`)
})
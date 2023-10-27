import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import { OrganisationModel } from "./schemas/OrganisationSchema"
import { PSSModel } from "./schemas/PSSSchema"
import { PSS } from "./@types/pss"
import "./schemas/OrganisationXSchema"
import "./schemas/OrganisationSchema"
import { Organisation } from "./@types/organisation"
import { arrayOf } from "arktype"
import { PSSDernormalized } from "./@types/pss"
import { PSSDenormalizedModel } from "./schemas/PSSDenormalizedSchema"
import { Transform } from "stream"

const PORT = process.env.PORT || 3000
const CONNECTION_STRING = `${process.env.MONGO_URI}`

const app = express()

app.use(cors())

const connection = mongoose.connection

mongoose.connect(CONNECTION_STRING)

connection.once("open", () => {
	console.log(`Connected to MongoDB: ${CONNECTION_STRING}`)
})

connection.on("error", (err) => {
	console.error(`Connection error: ${err}`)
})

const getDenormalisedResult = async (chunk: any) => {
	const { data: pss, problems: pssProblems } = PSS(chunk)
	const [rawOrganisation, rawPssByOrganisation] = await Promise.all([
		await OrganisationModel.findOne({
			entityNo_ftstr: chunk.organisationId_str,
		}).populate("organisationx"),
		await PSSModel.find({
			organisationId_str: chunk.organisationId_str,
		}),
	])
	const { data: organisation, problems: organisationProblems } =
		Organisation(rawOrganisation)

	const { data: pssByOrganisation, problems: pssByOrganisationProblems } =
		arrayOf(PSS)(rawPssByOrganisation)
	if (pssProblems || organisationProblems || pssByOrganisationProblems)
		throw new Error(
			JSON.stringify({
				pssProblems,
				organisationProblems,
				pssByOrganisationProblems,
			})
		)
	const isRegistered = pss.status_ftstr === "Registered"
	return {
		country: isRegistered
			? organisation.primaryAddr_obj.country_ftstr
			: pss.country_ftstr,
		postal_code: isRegistered
			? organisation.primaryAddr_obj.postalCode_ftstr
			: pss.postalCode_ftstr,
		pss_status: pss.status_ftstr,
		original_purpose: isRegistered
			? organisation.organisationx?.purpose_ftstr
			: pss.purpose_ftstr,
		purpose: isRegistered
			? organisation.organisationx?.purpose_ftstr === null &&
			  organisation.organisationx.siaFlag_b
				? "Security"
				: organisation.organisationx?.purpose_ftstr
			: pss.purpose_ftstr,
		directorate: isRegistered
			? organisation.organisationx?.pDept_ftstr_mv.join(",")
			: pss.directorateDisplayName_ftstr,
		section: isRegistered
			? organisation.organisationx?.pDept_ftstr_mv.join(",")
			: pss.sectionDisplayName_ftstr,
		building_name: isRegistered
			? organisation.primaryAddr_obj.addr_ft.split("\\n")[0] ?? null
			: pss.addr_ft.split("\\n")[0] ?? null,
		block_street: isRegistered
			? organisation.primaryAddr_obj.addr_ft.split("\\n")[1] ?? null
			: pss.addr_ft.split("\\n")[1] ?? null,
		level_unit: isRegistered
			? organisation.primaryAddr_obj.addr_ft.split("\\n")[2] ?? null
			: pss.addr_ft.split("\\n")[2] ?? null,
		address: isRegistered
			? organisation.primaryAddr_obj.addr_ft
			: pss.addr_ft,
		company_name: isRegistered
			? organisation.name_ftstr
			: pss.companyName_ftstr,
		present: isRegistered ? null : pss.userPresentAtAddr_b,
		security: isRegistered ? organisation.organisationx?.siaFlag_b : null,
		organisation_id: isRegistered ? organisation.entityNo_ftstr : null,
		username: isRegistered
			? pss.userOfPhysicalSetup_ftstr_mv.join(",")
			: "",
		user_type: null,
		longitude: isRegistered
			? organisation.primaryAddr_obj.geoCoord_obj.coordinates[0]
			: pss.geoCoord_obj.coordinates[0],
		latitude: isRegistered
			? organisation.primaryAddr_obj.geoCoord_obj.coordinates[1]
			: pss.geoCoord_obj.coordinates[1],
		submission_no: isRegistered
			? pssByOrganisation.map((x) => x.submissionNo_ftstr).join(",")
			: pss.submissionNo_ftstr,
	} satisfies PSSDernormalized
}

app.get("/api", async (req, res) => {
	try {
		let batch = 0
		const batchSize = 500
		let buffer: Promise<any>[] = []
		const transform = new Transform({
			objectMode: true,
			async transform(chunk, encoding, callback) {
				buffer.push(getDenormalisedResult(chunk))
				if (buffer.length >= batchSize) {
					this.push(buffer)
					buffer = []
				}
				callback()
			},
			async flush(callback) {
				if (buffer.length > 0) {
					this.push(buffer)
					buffer = []
				}
				callback()
			},
		})

		await PSSDenormalizedModel.deleteMany({})

		PSSModel.find({})
			.cursor()
			.pipe(transform)
			.pipe(
				new Transform({
					objectMode: true,
					async transform(chunk, encoding, callback) {
						const start = new Date()
						const items = await Promise.all(chunk)
						await PSSDenormalizedModel.insertMany(items)
						const end = new Date()
						console.log(
							`Batch ${batch++}, ${items.length} items in ${
								(end.getTime() - start.getTime()) / 1000
							}s`
						)
						callback()
					},
				})
			)

		return
	} catch (err) {
		console.error(err)
		return res.status(500).json(JSON.stringify(err))
	}
})

app.listen(PORT, () => {
	console.log(`Server is running on ${PORT}`)
})

import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import { OrganisationModel } from "./schemas/OrganisationSchema"
import { PSSModel } from "./schemas/PSSSchema"
import { PSS } from "./@types/pss"
import "./schemas/OrganisationXSchema"
import "./schemas/OrganisationSchema"
import { Organisation } from "./@types/organisation"
import { arrayOf, type } from "arktype"
import { PSSDernormalized } from "./@types/pss"
import { PSSDenormalizedModel } from "./schemas/PSSDenormalizedSchema"
import { Transform } from "stream"

const PORT = 3000
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

const getDenormalisedResult = async (
	pss: PSS,
	organisation: Organisation,
	submission_no: string,
	isRegistered: boolean
) => {
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
			? ""
			: pss.userOfPhysicalSetup_ftstr_mv.join(","),
		user_type: null,
		longitude: isRegistered
			? organisation.primaryAddr_obj.geoCoord_obj.coordinates[0]
			: pss.geoCoord_obj.coordinates[0],
		latitude: isRegistered
			? organisation.primaryAddr_obj.geoCoord_obj.coordinates[1]
			: pss.geoCoord_obj.coordinates[1],
		submission_no: submission_no,
	} satisfies PSSDernormalized
}

app.get("/health", (req, res) => {
	return mongoose.connection.readyState === 1
		? res.sendStatus(200)
		: res.sendStatus(500)
})

app.get("/api", async (req, res) => {
	try {
		const submissionNoByOrganisation = new Map<string, string>()
		const organisations = new Map<string, Organisation>()

		const transform = new Transform({
			objectMode: true,
			async transform(chunk, encoding, callback) {
				try {
					const calls = []
					const { data: pss, problems: pssProblems } = PSS(chunk)
					if (pssProblems)
						throw new Error(JSON.stringify(pssProblems))

					const isRegistered = pss.status_ftstr === "Registered"

					if (
						isRegistered &&
						!submissionNoByOrganisation.has(pss.organisationId_str)
					) {
						calls.push(
							(async () => {
								const rawPssByOrganisation =
									await PSSModel.find(
										{
											organisationId_str:
												chunk.organisationId_str,
										},
										{
											submissionNo_ftstr: 1,
											_id: 0,
										}
									)

								const { data, problems } = arrayOf(
									type({ submissionNo_ftstr: "string" })
								)(rawPssByOrganisation)

								if (problems)
									throw new Error(JSON.stringify(problems))
								submissionNoByOrganisation.set(
									pss.organisationId_str,
									data
										.map((x) => x.submissionNo_ftstr)
										.join(",")
								)
							})()
						)
					}

					if (!organisations.has(pss.organisationId_str)) {
						calls.push(
							(async () => {
								const rawOrganisation =
									await OrganisationModel.findOne({
										entityNo_ftstr: pss.organisationId_str,
									}).populate("organisationx")

								const {
									data: organisation,
									problems: organisationProblems,
								} = Organisation(rawOrganisation)

								if (organisationProblems) {
									throw new Error(
										JSON.stringify(organisation)
									)
								}

								organisations.set(
									pss.organisationId_str,
									organisation
								)
							})()
						)
					}

					await Promise.all(calls)

					const pssDenormalised = await getDenormalisedResult(
						pss,
						organisations.get(pss.organisationId_str)!,
						isRegistered
							? submissionNoByOrganisation.get(
									pss.organisationId_str
							  )!
							: pss.submissionNo_ftstr,
						isRegistered
					)

					await PSSDenormalizedModel.create(pssDenormalised)
				} catch (err) {
					console.error(err)
				}

				callback()
			},
		})
		await PSSDenormalizedModel.deleteMany({})

		PSSModel.find({}).cursor().pipe(transform).pipe(res)
		return
	} catch (err) {
		console.error(err)
		return res.status(500).json(JSON.stringify(err))
	}
})

app.listen(PORT, () => {
	console.log(`Server is running on ${PORT}`)
})

import { type } from "arktype"

export type PSS = typeof PSS.infer
export const PSS = type({
	country_ftstr: "string",
	postalCode_ftstr: "string",
	status_ftstr: "string",
	purpose_ftstr: "string",
	directorateDisplayName_ftstr: "string",
	sectionDisplayName_ftstr: "string",
	submissionNo_ftstr: "string",
	addr_ft: "string",
	companyName_ftstr: "string",
	organisationId_str: "string",
	userPresentAtAddr_b: "boolean",
	userOfPhysicalSetup_ftstr_mv: "string[]",
	geoCoord_obj: type({
		type: "string",
		coordinates: "number[]",
	}),
})

export type PSSDernormalized = typeof PSSDernormalized.infer
export const PSSDernormalized = type({
	country: "string|undefined|null",
	postal_code: "string|undefined|null",
	pss_status: "string|undefined|null",
	original_purpose: "string|undefined|null",
	purpose: "string|undefined|null",
	directorate: "string|undefined|null",
	section: "string|undefined|null",
	submission_no: "string|undefined|null",
	building_name: "string|undefined|null",
	block_street: "string|undefined|null",
	level_unit: "string|undefined|null",
	address: "string|undefined|null",
	company_name: "string|undefined|null",
	present: "boolean|undefined|null",
	security: "boolean|undefined|null",
	organisation_id: "string|undefined|null",
	username: "string|undefined|null",
	user_type: "string|undefined|null",
	longitude: "number|undefined|null",
	latitude: "number|undefined|null",
})
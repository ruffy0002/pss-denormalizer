import { type, union } from "arktype"

export type OrganisationX = typeof OrganisationX.infer
export const OrganisationX = type({
	organisationId_str: "any",
	purpose_ftstr: "string|null",
	siaFlag_b: "boolean",
	pDept_ftstr_mv: "any[]",
	pCode_ftstr: "string",
})

export type Organisation = typeof Organisation.infer
export const Organisation = type({
	entityNo_ftstr: "any",
	name_ftstr: "string",
	primaryAddr_obj: {
		country_ftstr: "string",
		postalCode_ftstr: "string",
		addr_ft: "string",
		geoCoord_obj: {
			type: "string",
			coordinates: "number[]",
		},
	},
	organisationx: union(OrganisationX, "null|undefined"),
})
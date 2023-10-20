import {
	condition,
	equal,
	and,
	reduce,
	concat,
	split,
	arrayElemAt,
	letExpr,
} from "../operators"
import { project } from "../stages"

const matchCondition = equal("$status_ftstr", "Registered")

export default () =>
	project({
		_id: 0,
		pss_status: "$status_ftstr",
		country: condition(
			matchCondition,
			"$organisation.primaryAddr_obj.country_ftstr",
			"$country_ftstr"
		),
		postal_code: condition(
			matchCondition,
			"$organisation.primaryAddr_obj.postalCode_ftstr",
			"$postalCode_ftstr"
		),
		original_purpose: condition(
			matchCondition,
			"$organisation.organisationx.purpose_ftstr",
			"$purpose_ftstr"
		),
		purpose: condition(
			matchCondition,
			condition(
				and([
					equal("$organisation.organisationx.purpose_ftstr", null),
					equal("$organisation.organisationx.siaFlag_b", true),
				]),
				"Security",
				"$organisation.organisationx.purpose_ftstr"
			),
			"$purpose_ftstr"
		),
		directorate: condition(
			matchCondition,
			"$organisation.organisationx.pDept_ftstr_mv",
			"$directorateDisplayName_ftstr"
		),
		submission_no: condition(
			matchCondition,
			reduce(
				"$submissionNo_ftstr_mv",
				concat([
					"$$value",
					condition(equal("$$value", ""), "", ","),
					"$$this",
				])
			),
			"$submissionNo_ftstr"
		),
		building_name: condition(
			matchCondition,
			letExpr(
				{
					address: split(
						{
							$replaceAll: {
								input: "$organisation.primaryAddr_obj.addr_ft",
								find: "\\n",
								replacement: ",",
							},
						},
						","
					),
				},
				arrayElemAt("$$address", 0)
			),
			letExpr(
				{
					address: split(
						{
							$replaceAll: {
								input: "$addr_ft",
								find: "\\n",
								replacement: ",",
							},
						},
						","
					),
				},
				arrayElemAt("$$address", 0)
			)
		),
		block_street: condition(
			matchCondition,
			letExpr(
				{
					address: split(
						{
							$replaceAll: {
								input: "$organisation.primaryAddr_obj.addr_ft",
								find: "\\n",
								replacement: ",",
							},
						},
						","
					),
				},
				arrayElemAt("$$address", 1)
			),
			letExpr(
				{
					address: split(
						{
							$replaceAll: {
								input: "$addr_ft",
								find: "\\n",
								replacement: ",",
							},
						},
						","
					),
				},
				arrayElemAt("$$address", 1)
			)
		),
		level_unit: condition(
			matchCondition,
			letExpr(
				{
					address: split(
						{
							$replaceAll: {
								input: "$organisation.primaryAddr_obj.addr_ft",
								find: "\\n",
								replacement: ",",
							},
						},
						","
					),
				},
				arrayElemAt("$$address", 2)
			),
			letExpr(
				{
					address: split(
						{
							$replaceAll: {
								input: "$addr_ft",
								find: "\\n",
								replacement: ",",
							},
						},
						","
					),
				},
				arrayElemAt("$$address", 2)
			)
		),
		address: condition(
			matchCondition,
			"$organisation.primaryAddr_obj.addr_ft",
			"$addr_ft"
		),
		section: condition(
			matchCondition,
			"$organisation.organisationx.pDept_ftstr_mv",
			"$sectionDisplayName_ftstr"
		),
		company_name: condition(
			matchCondition,
			"$organisation.organisationx.name_ftstr",
			"$companyName_ftstr"
		),
		present: condition(matchCondition, null, "$userPresentAtAddr_b"),
		security: condition(
			matchCondition,
			"$organisation.organisationx.siaFlag_b",
			null
		),
		organisation_id: condition(
			matchCondition,
			"$organisation.entityNo_ftstr",
			null
		),
		username: condition(
			matchCondition,
			"",
			reduce(
				"$userOfPhysicalSetup_ftstr_mv",
				concat([
					"$$value",
					condition(equal("$$value", ""), "", ","),
					"$$this",
				])
			)
		),
		user_type: condition(matchCondition, "", null),
		longitude: condition(
			matchCondition,
			arrayElemAt(
				"$organisation.primaryAddr_obj.geoCoord_obj.coordinates",
				0
			),
			arrayElemAt("$geoCoord_obj.coordinates", 0)
		),
		latitude: condition(
			matchCondition,
			arrayElemAt(
				"$organisation.primaryAddr_obj.geoCoord_obj.coordinates",
				1
			),
			arrayElemAt("$geoCoord_obj.coordinates", 1)
		),
	})

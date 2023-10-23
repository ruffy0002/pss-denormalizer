import { expr, equal, reduce, concat } from "../operators"
import { lookup, match, limit, project } from "../stages"

const lookupOrganisationx = lookup("organisationx", "organisationx", [
	match(expr(equal("$organisationId_str", "$$organisationId_str"))),
	limit(1),
	project({
		_id: 0,
		updated_at: 0,
		created_at: 0,
		pCode_ftstr: 0,
	}),
	project({
		siaFlag_b: 1,
		organisationId_str: 1,
		purpose_ftstr: 1,
		pDept_ftstr_mv: reduce(
			"$pDept_ftstr_mv",
			concat([
				"$$value",
				{
					$cond: {
						if: equal("$$value", ""),
						then: "",
						else: ",",
					},
				},
				"$$this",
			])
		),
	}),
])

export default lookupOrganisationx

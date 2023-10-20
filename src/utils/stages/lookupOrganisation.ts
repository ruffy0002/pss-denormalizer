import lookupOrganisationx from "./lookupOrganisationx"
import { lookup, match, limit, project } from "../stages"
import { expr, equal, unwind } from "../operators"

const lookupOrganisation = lookup(
	"organisation",
	"organisation",
	[
		match(expr(equal("$$organisationId_str", "$entityNo_ftstr"))),
		lookupOrganisationx,
		unwind("$organisationx"),
		limit(1),
		project({
			_id: 0,
			created_at: 0,
			updated_at: 0,
		}),
	],
	{
		organisationId_str: "$organisationId_str",
	}
)

const unwindOrganisation = unwind("$organisation")

export default () => {
	return [
        lookupOrganisation,
        unwindOrganisation
    ]
}

import { group, project } from "../stages"
import { mergeObjects, map, unwind } from "../operators"

const groupByOrganisation = group({
	_id: "$organisationId_str",
	pss: {
		$push: "$$ROOT",
	},
})

const mergePss = project({
	pss: map(
		"$pss",
		"pss",
		mergeObjects([
			"$$pss",
			{
				submissionNo_ftstr_mv: map(
					"$pss",
					"pss",
					"$$pss.submissionNo_ftstr"
				),
			},
		])
	),
})

const unwindPss = unwind("$pss")

const replaceRoot = {
	$replaceRoot: {
		newRoot: "$pss",
	},
}

export default () => {
	return [groupByOrganisation, mergePss, unwindPss, replaceRoot]
}

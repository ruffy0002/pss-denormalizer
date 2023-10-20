/*
 ** Types of stages
 ** lookup
 ** match
 ** limit
 ** group
 ** replaceRoot
 */

const lookup = (from: string, as: string, pipeline: {}[], letVar: {} = {}) => {
	return {
		$lookup: {
			from: from,
			as: as,
			let: letVar,
			pipeline: pipeline,
		},
	}
}

const match = (value: {}) => {
	return {
		$match: value,
	}
}

const limit = (value: number) => {
	return {
		$limit: value,
	}
}

const group = (value: {}) => {
	return {
		$group: value,
	}
}

const project = (value: {}) => {
	return {
		$project: value,
	}
}

export { lookup, match, limit, group, project }

/*
 ** Types of operators
 ** reduce
 ** unwind
 ** mergeObjects
 ** map
 ** concat
 ** cond
 ** and
 */

const reduce = (input: string, inExpr: {}, initialValue: string = "") => {
	return {
		$reduce: {
			input: input,
			initialValue: initialValue,
			in: inExpr,
		},
	}
}

const unwind = (path: string) => {
	return {
		$unwind: {
			path: path
		}
	}
}

const mergeObjects = (values: {}[]) => {
	return {
		$mergeObjects: values,
	}
}

const map = (input: string, as: string, inExpr: {}) => {
	return {
		$map: {
			input: input,
			as: as,
			in: inExpr,
		},
	}
}

const expr = (value: {}) => {
	return {
		$expr: value,
	}
}

const equal = (a: any, b: any) => {
	return {
		$eq: [a, b],
	}
}

const concat = (values: any[]) => {
	return {
		$concat: values,
	}
}

const condition = (ifExpr: {}, thenExpr: any, elseExpr: any) => {
	return {
		$cond: {
			if: ifExpr,
			then: thenExpr,
			else: elseExpr,
		},
	}
}

const and = (values: {}[]) => {
	return {
		$and: values,
	}
}

const split = (expr: any, delimiter: string) => {
	return {
		$split: [expr, delimiter],
	}
}

const arrayElemAt = (expr: string, index: number) => {
	return {
		$arrayElemAt: [expr, index],
	}
}

const letExpr = (vars: {}, inExpr: {}) => {
	return {
		$let: {
			vars: vars,
			in: inExpr,
		},
	}
}

export {
	reduce,
	unwind,
	mergeObjects,
	map,
	expr,
	equal,
	concat,
	condition,
	and,
	split,
	arrayElemAt,
	letExpr
}

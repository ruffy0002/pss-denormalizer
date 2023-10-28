import mongoose from "mongoose"
const { Schema } = mongoose

const PSSScehma = new Schema(
	{
		country_ftstr: String,
		postalCode_ftstr: String,
		status_ftstr: String,
		purpose_ftstr: String,
		directorateDisplayName_ftstr: String,
		sectionDisplayName_ftstr: String,
		submissionNo_ftstr: String,
		addr_ft: String,
		companyName_ftstr: String,
		organisationId_str: String,
		userPresentAtAddr_b: Boolean,
		userOfPhysicalSetup_ftstr_mv: [String],
		geoCoord_obj: {
			type: {
				type: String,
				enum: ["Point"],
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
	},
	{
		collection: "pss",
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
)

PSSScehma.virtual("organisation", {
	ref: "organisation",
	localField: "organisationId_str",
	foreignField: "entityNo_ftstr",
	justOne: true,
})

const PSSModel = mongoose.model("pss", PSSScehma)

export { PSSScehma, PSSModel }

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
		submissionNo_str: String,
		addr_ft: String,
		companyName_ftstr: String,
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
		organisationId_str: String,
	},
	{
		collection: "pss",
	}
)

const PSS = mongoose.model("pss", PSSScehma)

export { PSSScehma, PSS }

import mongoose from "mongoose"
const { Schema } = mongoose

const PSSDenormalizedSchema = new Schema(
	{
		country: String,
		postal_code: String,
		pss_status: String,
		original_purpose: String,
		purpose: String,
		directorate: String,
		section: String,
		submission_no: String,
		building_name: String,
		block_street: String,
		level_unit: String,
		address: String,
		company_name: String,
		present: Boolean,
		security: Boolean,
		organisation_id: String,
		username: String,
		user_type: String,
		longitude: Number,
		latitude: Number,
	},
	{
		collection: "pss_denormalized",
	}
)

const PSSDenormalizedModel = mongoose.model(
	"pss_denormalized",
	PSSDenormalizedSchema
)

export { PSSDenormalizedModel, PSSDenormalizedSchema }

import mongoose from "mongoose"
const { Schema } = mongoose

const OrganisationXSchema = new Schema(
	{
		organisationId_str: String,
		purpose_ftstr: String,
		siaFlag_b: Boolean,
		pDept_ftstr_mv: [String],
		pCode_ftstr: String,
	},
	{
		collection: "organisationx",
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
)

OrganisationXSchema.virtual("organisation", {
	ref: "organisation",
	localField: "organisationId_str",
	foreignField: "entityNo_ftstr",
	justOne: false,
})

const OrganisationX = mongoose.model("organisationx", OrganisationXSchema)

export default OrganisationX

export { OrganisationXSchema, OrganisationX }

import mongoose from "mongoose"
const { Schema } = mongoose

const OrganisationSchema = new Schema(
	{
		entityNo_ftstr: String,
		name_ftstr: String,
		primaryAddr_obj: {
			country_ftstr: String,
			postalCode_ftstr: String,
			addr_ft: String,
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
	},
	{
		collection: "organisation",
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
)

OrganisationSchema.virtual("organisationx", {
    ref: "organisationx",
    localField: "entityNo_ftstr",
    foreignField: "organisationId_str",
    justOne: true,
})

const OrganisationModel = mongoose.model("organisation", OrganisationSchema)

export { OrganisationSchema, OrganisationModel }
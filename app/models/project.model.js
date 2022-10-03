module.exports = mongoose => {
	const schema = mongoose.Schema(
		{
			name: String,
			budget: {type: Number, default: 0},
		},
		{ timestamps: true }
	);

	schema.method("toJSON", function () {
		const { __v, _id, ...object } = this.toObject();
		object.id = _id;
		return object;
	});

	const Project = mongoose.model("project", schema);
	return Project;
};
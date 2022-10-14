module.exports = mongoose => {
	const schema = mongoose.Schema(
		{
			name: String,
		},
		{ timestamps: true }
	);

	schema.method("toJSON", function () {
		const { __v, _id, ...object } = this.toObject();
		object.id = _id;
		return object;
	});

	const Supplier = mongoose.model("supplier", schema);
	return Supplier;
};
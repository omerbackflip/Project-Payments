module.exports = mongoose => {
	const schema = mongoose.Schema(
		{
			name: String,
		},
		{ timestamps: true }
	);

	const Supplier = mongoose.model("supplier", schema);
	return Supplier;
};
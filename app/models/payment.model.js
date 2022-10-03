module.exports = mongoose => {
	const schema = mongoose.Schema(
		{
			project: String,
			amount: {type: Number, default: 0},
			vat: String,
			paymentMethod: String,
			remark: String,				
			date: String,
			supplier: String,
			clear: String,
			invoiceId: String,
		},
		{ timestamps: true }
	);

	schema.method("toJSON", function () {
		const { __v, _id, ...object } = this.toObject();
		object.id = _id;
		return object;
	});

	const Payment = mongoose.model("payment", schema);
	return Payment;
};
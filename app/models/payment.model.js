module.exports = mongoose => {
	const schema = mongoose.Schema(
		{
			project: String,
			amount: {type: Number, default: 0},
			vat: String,
			paymentMethod: String,
			remark: String,				
			date: { type: Date , default: Date.now},
			supplier: String,
			clear: String,
			invoiceId: String,
		},
		{ timestamps: true }
	);

	const Payment = mongoose.model("payment", schema);
	return Payment;
};
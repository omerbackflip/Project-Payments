var mongoose = require('mongoose') 
  , Schema = mongoose.Schema;

module.exports = mongoose => {
	const schema = mongoose.Schema(
		{
			name: String,
			budget: {type: Number, default: 0},
			payments: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
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
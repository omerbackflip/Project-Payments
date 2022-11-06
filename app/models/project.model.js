var mongoose = require('mongoose') 
  , Schema = mongoose.Schema;

module.exports = mongoose => {
	const schema = mongoose.Schema(
		{
			name: String,
			budget: {type: Number, default: 0},
			suppliers: [{
				supplier: {type: Schema.Types.ObjectId, ref: 'supplier'},
				name: String,
				budget: {type: Number , default: 0},
				payments: [{ type: Schema.Types.ObjectId, ref: 'payment' }],	
			}],
		},
		{ timestamps: true }
	);

	const Project = mongoose.model("project", schema);
	return Project;
};
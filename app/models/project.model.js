var mongoose = require('mongoose') 
  , Schema = mongoose.Schema;

module.exports = mongoose => {
	const schema = mongoose.Schema(
		{
			project: String,
			budget: {type: Number, default: 0},
			suppliers: [{
				supplier: String,
				budget: {type: Number , default: 0},	
			}],
		},
		{ timestamps: true }
	);

	const Project = mongoose.model("project", schema);
	return Project;
};
var mongoose = require('mongoose') 
  , Schema = mongoose.Schema;

module.exports = mongoose => {
	const schema = mongoose.Schema(
		{
			name: String,
			budget: {type: Number, default: 0},
			suppliers: [{
				name: String,
				budget: {type: Number , default: 0},	
			}],
		},
		{ timestamps: true }
	);

	const Project = mongoose.model("project", schema);
	return Project;
};
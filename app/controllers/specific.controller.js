const db = require("../models");
const Project = db.projects;
const Supplier = db.suppliers;
const Payment = db.payments;
const dbService = require("../services/db-service");
const paymentService = require("../services/payment-service");
const csv = require('csvtojson');
const fs = require('fs');

exports.savePaymentsBulk = async (req, res) => {

	try {
        await Promise.all([Project.remove(), Supplier.remove(), Payment.remove()]);
		let data = await csv().fromFile(`uploads/${req.file.filename}`);
        const {projects , payments} = paymentService.getProjectsAndProjectsToSave(data);
        const [savedProjects , savedPayments] = await Promise.all([
            dbService.insertMany(Project,projects),
            dbService.insertMany(Payment,payments),
        ]);

        const suppliers = paymentService.getSuppliersToSave(savedPayments);
        await dbService.insertMany(Supplier,suppliers);
        unLinkFile(`uploads/${req.file.filename}`);
        return res.send({ success: true, message: "Data successfully Imported"});

	} catch (error) {
		console.log(error)
		res.status(500).send({ message: "Error saving payments", error });
	}
};

function unLinkFile(path) {
	fs.unlinkSync(path);
}
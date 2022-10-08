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

exports.deleteProjectAndData = async (req, res) => {
	try {
        const project = await Project.findOne({_id: req.params.projectId});
        await Promise.all([
            Project.deleteOne({_id: project._id}),
            Payment.deleteMany({project: project.name}),
            Supplier.updateMany({}, {
                $pullAll: {
                    payments: [project._id],
                },
            })
        ]);        
        
        return res.send({ success: true, message: "Project and it's data successfully deleted!"});

	} catch (error) {
		console.log(error)
		res.status(500).send({ message: "Error deleting project", error });
	}
};

exports.getMainViewProjectData = async (req, res) => {
    try {
        let projects = await Project.find().lean();
        if( projects && projects.length) {

            const data = await Promise.all([

                ...projects.map(async project => {
                    project.suppliers = [];
                    const payments = await Payment.find({project: project.name}).lean();
                    if(payments && payments.length) {
                        let index = -1;

                        payments.map(payment => {
                            index = project.suppliers.findIndex(supplier => supplier.name === payment.supplier);
                            if(index >= 0) {
                                project.suppliers[index].payments.push(payment);
                                return;
                            }
                            project.suppliers.push({name: payment.supplier , payments: [payment] });
                        });

                    }
                    return project;
                })

            ]);

            return res.send({success: true, projects: data});

        }
    } catch (error) {
        console.log(error)
		res.status(500).send({ message: "Error getting main view project data", error });
    }
}

function unLinkFile(path) {
	fs.unlinkSync(path);
}
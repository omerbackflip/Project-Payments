const db = require("../models");
const Project = db.projects;
const Supplier = db.suppliers;
const Payment = db.payments;
const dbService = require("../services/db-service");
const paymentService = require("../services/payment-service");
const csv = require('csvtojson');
const fs = require('fs');
var mongoose = require('mongoose');
const { suppliers } = require("../models");

exports.savePaymentsBulk = async (req, res) => {

	try {
        await Promise.all([Project.remove(), Supplier.remove(), Payment.remove()]);
		let data = await csv().fromFile(`uploads/${req.file.filename}`);
        const {suppliers , payments} = paymentService.getSuppliersAndPaymentsToSave(data);
        const [savedSuppliers , savedPayments] = await Promise.all([
            dbService.insertMany(Supplier,suppliers),
            dbService.insertMany(Payment,payments),
        ]);

        const projects = paymentService.getProjectsToSave(savedSuppliers , savedPayments);
        await dbService.insertMany(Project,projects);
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
        let projects = await Project.find().populate('suppliers.supplier').populate('suppliers.payments').lean();
        if( projects && projects.length) {
            for (i=0;i<projects.length;i++){
                let projectSum = 0;
                for (j=0;j<projects[i].suppliers.length;j++){
                    let supplierSum = 0;
                    for (k=0;k<projects[i].suppliers[j].payments.length;k++){
                        supplierSum += projects[i].suppliers[j].payments[k].amount;
                    }
                    projects[i].suppliers[j].total = supplierSum;
                    projectSum += supplierSum;
                }
                projects[i].total = projectSum;
            }
            return res.send({success: true, projects});
        }
    } catch (error) {
        console.log(error)
		res.status(500).send({ message: "Error getting main view project data", error });
    }
}

exports.getMainViewSupplierData = async (req, res) => {
    try {
        let suppliers = await Supplier.find().lean();
        if( suppliers && suppliers.length) {
            let payments = await Payment.find().lean();
            //loop for each supplier and map related payments
            for (i=0 ; i < suppliers.length ; i++){
                let allSupplierPayments = payments.filter((item) => {  
                    return (item.supplier === suppliers[i].name)
                })
                // build list of project to each supplier
                const listOfProjects = [];
                allSupplierPayments.map(x => listOfProjects.filter(a => a.project == x.project).length > 0 
                    ? null 
                    : listOfProjects.push(x)
                );

                let listOfPaymentsForProject = [];
                // console.log(suppliers[i].name + " - " + listOfProjects.length + " PROJECTS")

                for (j=0 ; j < listOfProjects.length ; j++){
                    // console.log(allSupplierPayments[j].project + " - " + listOfProjects[j].project)
                    listOfPaymentsForProject = allSupplierPayments.filter((item) => {
                        return (item.project === listOfProjects[j].project)
                    })

                    listOfProjects[j].payments = "listOfPaymentsForProject";
                    // console.log("=========" + listOfProjects[j].project)
                }

                suppliers[i].projects = listOfProjects.map((item) => {
                    return ({"name":item.project , "payed":555, "payments":item.payments})
                })
            }
            return res.send({success: true, suppliers});
        }
    } catch (error) {
        console.log(error)
		res.status(500).send({ message: "Error getting main view supplier data", error });
    }
}


exports.addSupplierBudgetsToProject = async(req,res) => {
    try {
        const { projectId } = req.params;
        const supplierBudgets = req.body.map(item => {
            return {
                supplier: mongoose.Types.ObjectId(item.supplier),
                budget: item.budget,
                payments: item.payments
            }
        });

        if(supplierBudgets && supplierBudgets.length) {
            await Project.updateOne({_id: projectId}, { suppliers: supplierBudgets });
        }
        return res.send({success: true, message: "Successfully added budgets to suppliers"});

    } catch (error) {
        console.log(error)
		res.status(500).send({ message: "Error getting suppliers and their associated budgets", error });
    }
}

function unLinkFile(path) {
	fs.unlinkSync(path);
}
const db = require("../models");
const Project = db.projects;
const Supplier = db.suppliers;
const Payment = db.payments;
const Table = db.tables;
const Book = db.books;
const dbService = require("../services/db-service");
const paymentService = require("../services/payment-service");
const csv = require('csvtojson');
const fs = require('fs');
var mongoose = require('mongoose');
const { suppliers } = require("../models");
const { query } = require("express");

exports.savePaymentsBulk = async (req, res) => {

	try {
        await Promise.all([Project.deleteMany(), Payment.deleteMany(), Table.deleteMany()]);
		let data = await csv().fromFile(`uploads/${req.file.filename}`);
        const {projects1, suppliers , payments} = paymentService.getProjectsAndSuppliersAndPaymentsToSave(data);
        let suppList = [...suppliers];
        let projList = [...projects1];
        suppList = suppList.map((item) =>{
            return ( { 'table_id' : '1' , 'description' : item.name})
        });
        // projList = projList.map((item) =>{
        //     return ( { 'table_id' : '2' , 'description' : item.name})
        // });
        const [savedSuppliers , savedPayments] = await Promise.all([
            dbService.insertMany(Table,suppList),
            // dbService.insertMany(Supplier,suppliers),
            dbService.insertMany(Payment,payments),
            // dbService.insertMany(Table,projList),
        ]);

        const projects = paymentService.getProjectsToSave(savedSuppliers , savedPayments);
        await dbService.insertMany(Project,projects);
        unLinkFile(`uploads/${req.file.filename}`);
        return res.send({ success: true, message: `Total ${projects.length} projects successfully Imported`});

	} catch (error) {
		console.log(error)
		res.status(500).send({ message: "Error saving payments", error });
	}
};

exports.saveBooksBulk = async (req, res) => {

	try {
        await Promise.all([Book.deleteMany({company: req.query.company, year: req.query.importYear})]);
		let data = await csv().fromFile(`uploads/${req.file.filename}`);
        let books = [];

        data.forEach(item => {
            if(item.asmchta_date) { // exclude empty rows in the CSV Book
                const [day,month,year] = item.asmchta_date.split('/')
                let book = {
                    company: req.query.company,
                    asmchta_date: new Date(+year, +month - 1, +day),
                    record_id: item.record_id,
                    year: item.year,
                    record_schum: item.record_schum,
                    pratim: item.pratim,
                    asmacta1: item.asmacta1,
                    schum_hova: item.schum_hova,
                    schum_zchut: item.schum_zchut,
                    cust_lname: item.cust_lname,
                    cust_fname: item.cust_fname,
                    bs_item_name: item.bs_group_name,
                    bs_group_name: item.bs_item_name,
                }
                books.push(book);
            }
        });

        const [savedBooks] = await Promise.all([
            dbService.insertMany(Book,books),
        ]);

        unLinkFile(`uploads/${req.file.filename}`);
        return res.send({ success: true, message: `Total ${savedBooks.length} books successfully Imported`});

	} catch (error) {
		console.log(error)
		res.status(500).send({ message: "Error saving books", error });
	}
};

exports.deleteProjectAndData = async (req, res) => {
	try {
        const project = await Project.findOne({_id: req.params.projectId});
        await Promise.all([
            Project.deleteOne({_id: project._id}),
            // Payment.deleteMany({project: project.name}),
            // Supplier.updateMany({}, {
            //     $pullAll: {
            //         payments: [project._id],
            //     },
            // })
        ]);

        return res.send({ success: true, message: "Project and it's data successfully deleted!"});

	} catch (error) {
		console.log(error)
		res.status(500).send({ message: "Error deleting project", error });
	}
};

// Build Projects structure data from PAYMENTs :   Projects => Suppliers => payments
exports.getMainViewProjectData = async (req, res) => {
    try {
        let projects = await Project.find().lean();
        if(projects && projects.length) {
            await Promise.all(projects.map(async project => {
                project.suppliers = await Payment.find({"project" : project.project}, 'supplier').lean();
                // filter to get unique supplier list
                project.suppliers = project.suppliers.filter((value, index, self) =>
                    index === self.findIndex((t) => ( t.supplier === value.supplier))
                )
                // build the suppliers array
                if(project.suppliers && project.suppliers.length) {
                    await Promise.all(project.suppliers.map(async supplier=> {
                        supplier.payments = await Payment.find({supplier: supplier.supplier , project: project.project}).lean();
                        supplier.payed = supplier.payments.reduce((payed, item) => {
                            return item.amount + payed
                        }, 0)
                        // fatch the supplier-budget from Project table
                        let proj = await Project.findOne({project: project.project})
                        let supp = proj.suppliers.filter((item) => {
                            return (item.supplier === supplier.supplier )
                        })
                        supplier.budget = supp[0].budget
                    }));
                }
            }))
        }
        projects = projects.map((item) => {
            const total = item.suppliers.reduce((payed, item1) => {
                return (item1.payed + payed)
            }, 0)
            return ({...item, payed: total})
        })
        return res.send({success: true, projects});
    } catch (error) {
        console.log(error)
		res.status(500).send({ message: "Error getting main view project data", error });
    }
}

// Build Suppliers structure data from PAYMENTs :   Suppliers => Projects => payments
exports.getMainViewSupplierData = async (req, res) => {
    try {
        // let suppliers = await Supplier.find().lean();
        let suppliers = await Table.find({table_id : '1' }).lean();
        suppliers = suppliers.map((item) => {
            return ({id: item._id , supplier : item.description}) // "id" is needed for later use (e.g for delete or update)
        })
        if(suppliers && suppliers.length) {
            await Promise.all(suppliers.map(async supplier => {
                supplier.projects = await Payment.find({"supplier" : supplier.supplier}, 'project').lean();
                supplier.projects = supplier.projects.filter((value, index, self) =>
                    index === self.findIndex((t) => ( t.project === value.project))
                )
                if(supplier.projects && supplier.projects.length) {
                    await Promise.all(supplier.projects.map(async project=> {
                        project.payments = await Payment.find({supplier: supplier.supplier, project: project.project}).lean();
                        project.payed = project.payments.reduce((payed, item) => {
                            return item.amount + payed
                        }, 0)
                    }));
                }
            }))
            suppliers = suppliers.map((item) => {
                const total = item.projects.reduce((payed, item1) => {
                    return (item1.payed + payed)
                }, 0)
                return ({...item, payed: total})
            })
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
                // supplier: mongoose.Types.ObjectId(item.supplier),
                supplier: item.supplier,
                budget: item.budget,
                // payments: item.payments
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
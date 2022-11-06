exports.getProjectsAndSuppliersAndPaymentsToSave = (data) => {
    try {
        const uniqueSuppliers = [...new Set(data.map(item => item.supplier))];
        const suppliers = uniqueSuppliers.map(item => {return {name: item}});

        const uniqueProjects = [...new Set(data.map(item => item.project))];
        const projects1 = uniqueProjects.map(item => {return {name: item}});

        let payments = [];

        data.forEach(item => {
            let payment = {
                project: (item.project || ''),
                budget: item.budget || 0,
                amount: item.amount,
                vat: item.vat,
                paymentMethod: item.payMethod,
                remark: item.remark,				
                date: new Date(item.date),
                supplier: item.supplier,
                clear: item.clear,
                invoiceId: item.invoiceId,
            }

            payments.push(payment);
        });

        return { projects1, suppliers , payments };

    } catch (error) {
        console.log(error)
        throw error;
    }
}

exports.getProjectsToSave = (suppliers,payments) => {
    let projects = [] , projectIndex = -1 , supplierIndex = -1 , supplierId = 0;
    if(payments && payments.length) {
        payments.map(async payment => {

            supplierId = suppliers[suppliers.findIndex(supplier => supplier.name === payment.supplier)]._id;
            projectIndex = projects.findIndex(project => project.name === payment.project);

            if(projectIndex >= 0) {
                supplierIndex = projects[projectIndex].suppliers.findIndex(supplier => String(supplier.supplier) === String(supplierId));
                if(supplierIndex >= 0) {
                    projects[projectIndex].suppliers[supplierIndex].payments.push(payment._id);
                    return;
                }
                projects[projectIndex].suppliers.push({payments: [payment._id] , supplier: supplierId });
                return;
            }    
            projects.push({ 
                name: payment.project,  
                suppliers: [{
                    payments: [payment._id], 
                    supplier: supplierId
                }], 
            });
        });
    }
    return projects;
}

exports.addPaymentToSupplierMiddleWare = async (model, payment) => {
    if(payment && payment._id) {
        const supplier = await model.suppliers.findOne({name: payment.supplier});

        if(await model.projects.exists({name: payment.project, 'suppliers.supplier': supplier._id})) {

            const project = await model.projects.findOne({name: payment.project});
            const index = project.suppliers.findIndex(item => String(item.supplier) === String(supplier._id));
            project.suppliers[index].payments.push(payment._id);
            await model.projects.updateOne({name: project.name}, project);

        } else {
            await model.projects.updateOne({name: payment.project}, 
                { $push: { "suppliers": { payments : [payment._id] , supplier: supplier._id } } },
            )
        }
    }
}
exports.getProjectsAndSuppliersAndPaymentsToSave = (data) => {
    try {

        const uniqueSuppliers = [...new Set(data.map(item => item.supplier))];
        const suppliers = uniqueSuppliers.map(item => {return {name: item}});

        const uniqueProjects = [...new Set(data.map(item => item.project))];
        const projects1 = uniqueProjects.map(item => {return {name: item}});

        let payments = [];

        data.forEach(item => {
            let hebDate = (item.date).substring(3,5).concat('/').concat((item.date).substring(0,2)).concat('/').concat((item.date).substring(6,10))
            let payment = {
                project: (item.project || ''),
                budget: item.budget || 0,
                amount: item.amount.replace(",",""),
                vat: item.vat,
                paymentMethod: item.payMethod,
                remark: item.remark,				
                date: !isNaN(new Date (hebDate)) ? new Date(hebDate) : null,
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
    let projects = [] , projectIndex = -1 , supplierIndex = -1 , supplierName = '';
    if(payments && payments.length) {
        payments.map(async payment => {

            supplierName = suppliers[suppliers.findIndex(supplier => supplier.description === payment.supplier)].description;
            projectIndex = projects.findIndex(project => project.project === payment.project);

            if(projectIndex >= 0) {
                supplierIndex = projects[projectIndex].suppliers.findIndex(supplier => supplier.supplier === supplierName);
                if(supplierIndex >= 0) return;
                projects[projectIndex].suppliers.push({ supplier: supplierName });
                return;
            }    
            projects.push({ project: payment.project, suppliers: [{ supplier: supplierName}] });
        });
    }
    // console.log(projects)
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
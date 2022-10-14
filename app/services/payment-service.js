exports.getSuppliersAndPaymentsToSave = (data) => {
    try {
        const uniqueSuppliers = [...new Set(data.map(item => item.supplier))];
        const suppliers = uniqueSuppliers.map(item => {return {name: item}});

        let payments = [];

        data.forEach(item => {
            let payment = {
                project: (item.project || ''),
                budget: item.budget || 0,
                amount: item.amount,
                vat: item.vat,
                paymentMethod: item.payMethod,
                remark: item.remark,				
                date: item.date,
                supplier: item.supplier,
                clear: item.clear,
                invoiceId: item.invoiceId,
            }

            payments.push(payment);
        });

        return { suppliers , payments };

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
        await model.updateOne({name: payment.supplier} , 
            { $push: { payments: payment._id } },            
        );
    }
}
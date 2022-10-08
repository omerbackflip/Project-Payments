exports.getProjectsAndProjectsToSave = (data) => {
    try {
        const uniqueProjects = [...new Set(data.map(item => item.project))];
        const projects = uniqueProjects.map(item => {return {name: item}});
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

        return { projects , payments };

    } catch (error) {
        console.log(error)
        throw error;
    }
}

exports.getSuppliersToSave = (payments) => {
    let suppliers = [];
    if(payments && payments.length) {
        payments.forEach(payment => {
            if(suppliers.length) {
                let index = suppliers.findIndex(i => i && payment.supplier === i.name);
                if(index >= 0) {
                    suppliers[index].payments.push(payment._id);
                    return;
                }    
            }
            suppliers.push({name: payment.supplier , payments: [payment._id]});
        });
    }
    return suppliers;
}

exports.addPaymentToSupplierMiddleWare = async (model, payment) => {
    if(payment && payment._id) {
        await model.updateOne({name: payment.supplier} , 
            { $push: { payments: payment._id } },            
        );
    }
}
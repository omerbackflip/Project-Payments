exports.getSingleItem = async (model,query) => {
    try {
        return await model.findOne(query);
    } catch (error) {
        console.log(error)
        throw error;
    }
},
exports.getMultipleItems = async (model,query) => {
    try {
        return await model.find(query);
    } catch (error) {
        console.log(error)
        throw error;
    }
},
exports.updateItem = async (model,query,payload) => {
    try {
        // console.log (model)  //  Model { table || project || payment ..... }
        // console.log (query)  // { _id: '63767a0a4d89470120ae0195' }
        // console.log (payload) // 
        return await model.findOneAndUpdate(query,payload);
    } catch (error) {
        console.log(error)
        throw error;
    }
},
exports.createItem = async (model,payload) => {
    try {
        // console.log (model)  //  Model { table || project || payment ..... }
        // console.log (payload) // 
        return await model.create(payload);
    } catch (error) {
        console.log(error)
        throw error;
    }
},

exports.insertMany = async (model,payload) => {
    try {
        return await model.insertMany(payload);
    } catch (error) {
        console.log(error)
        throw error;
    }
},

exports.deleteItem = async (model,query) => {
    try {
        // console.log (model)  //  Model { table || project || payment ..... }
        // console.log (query)  // { _id: '63767a0a4d89470120ae0195' }
        return await model.deleteOne(query);
    } catch (error) {
        console.log(error)
        throw error;
    }
},
exports.deleteMany = async (model,query) => {
    try {
        return await model.deleteMany(query);
    } catch (error) {
        console.log(error)
        throw error;
    }
}
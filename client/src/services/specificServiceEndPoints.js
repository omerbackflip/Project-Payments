import axios from "axios";
import http from "../http-common";
const baseUrl = process.env.VUE_APP_API_URL;
class SpecificServiceEndPoints {

	async savePaymentsImport(file) {
		var formData = new FormData();
		formData.append("file", file);
		return await axios.post(`${baseUrl}/specific/save-payments`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		});
	}

	async saveBooksImport(file,company,importYear) {
		var formData = new FormData();
		formData.append("file", file);
		return await axios.post(`${baseUrl}/specific/save-books`, formData ,{params:{company, importYear}},{ 
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		});
	}

	async deleteProjectAndCorrespondingData(projectId) {
		return await http.put(`${baseUrl}/specific/delete-project/${projectId}`);
	}

	async retrieveAllProjectsData() {
		return await http.get(`${baseUrl}/specific/main-view-project-data`);
	}

	async retrieveAllSuppliersData() {
		return await http.get(`${baseUrl}/specific/main-view-supplier-data`);
	}

	async addProjectBudgetsToSupplier(projectId,supplierBudgets) {
		return await http.put(`${baseUrl}/specific/add-supplier-budgets/${projectId}`, supplierBudgets);
	}

}

export default new SpecificServiceEndPoints();
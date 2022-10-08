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

	async deleteProjectAndCorrespondingData(projectId) {
		return await http.put(`${baseUrl}/specific/delete-project/${projectId}`);
	}

	async retrieveAllProjectsData() {
		return await http.get(`${baseUrl}/specific/main-view-project-data`);
	}

}

export default new SpecificServiceEndPoints();
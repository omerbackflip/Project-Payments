import axios from "axios";
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

}

export default new SpecificServiceEndPoints();
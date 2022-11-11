<template>
	<div class="text-center">
		<v-dialog v-model="dialog" width="500">
			<v-card>
				<v-card-title class="text-h5 grey lighten-2">
					Import Books
				</v-card-title>

				<v-card-text> Please select file to import </v-card-text>
				<v-file-input @change="setFile"></v-file-input>
				<v-divider></v-divider>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="primary" text @click="toggleDialog()"> Close </v-btn>
					<v-btn :disabled = "!file" color="primary" text @click="submitFile()"> Submit </v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-snackbar :v-model="message.length" :multi-line="true">
			{{ message }}

			<template v-slot:action="{ attrs }">
				<v-btn color="red" text v-bind="attrs" @click="message = ''">
				Close
				</v-btn>
			</template>
		</v-snackbar>
	</div>
</template>

<script>
import SpecificServiceEndPoints from "../services/specificServiceEndPoints";

export default {
	props: {
		openImportModal: Boolean,
		setImportModal: Function,
	},
	data() {
		return {
			file: null,
			message: "",
			dialog: false,
		};
	},
	methods: {
		toggleDialog() {
			this.setImportModal(false);
		},
		setFile(file) {
			this.file = file;
		},
		async submitFile() {
			try {
				const response = await SpecificServiceEndPoints.saveBooksImport(this.file);
				if (response.data && response.data.success) {
					this.message = "Books successfully imported";
					setTimeout(() => {
						this.toggleDialog();
					}, 1500);
					window.location.reload();
				}
			} catch (error) {
				console.log(error);
				this.message = "Something went wrong! Please try again later!";
			}
		},
	},
	mounted() {
		this.dialog = this.openImportModal;
	}
};
</script>
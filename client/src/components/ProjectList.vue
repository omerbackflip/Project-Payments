<template>
	<div class="list row">
		<v-layout class="mt-1" row wrap>
			<v-card>
				<v-data-table
					:headers="headers"
					disable-pagination
					hide-default-footer
					fixed-header
					height="75vh"
					:items="projects"
				>
					<template v-slot:top>
						<v-toolbar flat>
							<v-toolbar-title>All Projects</v-toolbar-title>
							<v-spacer></v-spacer>
							<v-btn @click="dialog = true">
								<v-icon class="nav-icon" small >mdi-plus</v-icon>
								New Project
							</v-btn>
						</v-toolbar>
					</template>
					<template v-slot:[`item.createdAt`]="{ item }">
						<span>{{ new Date(item.createdAt).toLocaleString() }}</span>
					</template>

					<template v-slot:[`item.controls`]="{ item }">
						<v-btn @click="updateProject(item)" x-small>
							<v-icon small>mdi-pencil</v-icon>
						</v-btn>
					</template>

				</v-data-table>
			</v-card>
		</v-layout>

		<v-dialog v-model="dialog" width="500">
			<v-card>
				<v-card-title class="text-h5 grey lighten-2">
					{{!update ? 'New' : 'Update'}} Project
				</v-card-title>
				<div class="field-margin" v-show="showMessage">
					{{message}}
				</div>
				<v-text-field class="field-margin" v-model="project.name" label="Name"></v-text-field>
				<v-text-field class="field-margin" v-model="project.budget" label="Budget"></v-text-field>

				<v-divider></v-divider>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="primary" text @click="dialog = false"> Close </v-btn>
					<v-btn :disabled = "!project.name" color="primary" text @click="submitProject()"> Submit </v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

	</div>
</template>



<script>
import { PROJECT_MODEL } from "../constants/constants";
import apiService from "../services/apiService";

export default {
	name: "project-list",
	data() {
		return {
			projects: [],
			project: {
				budget: '',
				name: '',
			},
			update: 0,
			dialog: false,
			showMessage: false,
			message: '',
			headers: [
				{ text: 'Name', value: 'name' },
				{ text: 'Budget', value: 'budget' },
				{ text: 'Date Created', value: 'createdAt' },
				{ text: 'Controls', value: 'controls' },
			],
		}
	},

	methods: {
		async getProjects() {
			try {
				const response = await apiService.get({model: PROJECT_MODEL});
				this.projects = response.data;
			} catch (error) {
				console.log(error);
			}
		},
		updateProject(item) {
			this.project = {name: item.name , budget: item.budget};
			this.dialog = true;
			this.update = item.id;
		},
		async submitProject() {
			try {
				let response;
				if(!this.update) {
					response = await apiService.create(this.project , {model:PROJECT_MODEL});
				} else {
					response = await apiService.update(this.update , this.project , {model:PROJECT_MODEL});
				}
				if(response.data) {
					this.message = 'Project successfully created/updated!';
					this.showMessage = true;
					this.getProjects();
					this.update = 0;
					setTimeout(() => {
						this.dialog = false;
						this.showMessage = false;
					}, 2000);
				}
			} catch (error) {
				console.log(error);
			}
		}
	},
	mounted() {
		this.getProjects();
	},
};
</script>

<style>

.field-margin{
	margin: 12px;
}
</style>

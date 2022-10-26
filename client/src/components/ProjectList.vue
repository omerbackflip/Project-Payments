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
					mobile-breakpoint="0"
				>
					<template v-slot:top>
						<v-toolbar flat>
							<v-toolbar-title>All Projects</v-toolbar-title>
							<v-spacer></v-spacer>
							<v-btn @click="updateProject()">
								<v-icon class="nav-icon" small >mdi-plus</v-icon>
								New Project
							</v-btn>
						</v-toolbar>
					</template>
					<template v-slot:[`item.total`]="{ item }">
						<span>{{ item.total.toLocaleString() }}</span>
					</template>

					<template v-slot:[`item.controls`]="{ item }">
						<v-btn @click="updateProject(item)" x-small>
							<v-icon small>mdi-pencil</v-icon>
						</v-btn>
						<v-btn class="ml-1" @click="deleteProject(item._id)" x-small>
							<v-icon small>mdi-delete</v-icon>
						</v-btn>
					</template>

				</v-data-table>
			</v-card>
		</v-layout>

		<confirm-dialog ref="confirm"/>
		<project-form ref="projectForm"/>

	</div>
</template>



<script>
import specificServiceEndPoints from '../services/specificServiceEndPoints';
import ConfirmDialog from './Common/ConfirmDialog.vue';
import ProjectForm from './ProjectForm.vue';

export default {
	name: "project-list",
	components: { ConfirmDialog, ProjectForm },
	data() {
		return {
			projects: [],
			headers: [
				{ text: 'Name', value: 'name' },
				{ text: 'Budget', value: 'budget' },
				{ text: 'Payed', value: 'total', align: 'right' },
				{ text: 'Controls', value: 'controls' },
			],
		}
	},

	methods: {
		async getProjects() {
			try {
				const response = await specificServiceEndPoints.retrieveAllProjectsData();
				if(response.data && response.data.success) {
					this.projects = response.data.projects;
				}			
			} catch (error) {
				console.log(error);
			}
		},
		async deleteProject(id) {
			try {
				if(id) {
					if(await this.$refs.confirm.open( "Confirm", "Are you sure to delete this project? This will also delete all related payments")){
						await specificServiceEndPoints.deleteProjectAndCorrespondingData(id);
						this.getProjects();
					}
				}
			} catch (error) {
				console.log(error);		
			}
		},
		async updateProject(item) {
			let newProject = item ? false : true;
			await this.$refs.projectForm.open(item, newProject);
			this.getProjects();
		},
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

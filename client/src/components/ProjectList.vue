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
					:expanded.sync="expanded"
					item-key="project"
					show-expand
					single-expand
					mobile-breakpoint="0"
				>
					<template v-slot:top>
						<v-toolbar flat>
							<v-toolbar-title>פרויקטים - {{projects.length}}</v-toolbar-title>
							<v-spacer></v-spacer>
							<v-btn @click="updateProject()" small>
								<v-icon class="nav-icon" small >mdi-plus</v-icon>
								הוספת פרויקט
							</v-btn>
						</v-toolbar>
					</template>
					<template v-slot:expanded-item="{item}">
						<td :colspan="headers.length">
							<v-data-table 
								:headers="supplierHeaders"
								:items="item.suppliers"
								dense
								disable-pagination
								hide-default-footer
								@click:row="onSupplierSelect"
								mobile-breakpoint="0"
								class="expanded-datatable">
								<template v-slot:[`item.payed`]="{ item }">
									{{item.payed.toLocaleString() || 0 }}
								</template>
								<!-- <template v-slot:[`item.controls`]="{ item }">
									<PaymentsDialog :payments="item.payments"/>
								</template> -->
							</v-data-table>
						</td>
					</template>
					<template v-slot:[`item.budget`]="{ item }">
						{{item.budget.toLocaleString()}}
					</template>
					<template v-slot:[`item.payed`]="{ item }">
						{{item.payed.toLocaleString()}}
					</template>
					<template v-slot:[`item.createdAt`]="{ item }">
						<span>{{ new Date(item.createdAt).toLocaleString() }}</span>
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
		<project-form ref="projectForm"/>
		<confirm-dialog ref="confirm"/>
		<div>
			<PaymentsDialog :payments="supplierPayments" :showPaymentsDialog="showPaymentsDialog" @close="onClosePaymentDialog"/>
		</div>
	</div>
</template>



<script>
import { PROJECT_MODEL } from "../constants/constants";
import apiService from "../services/apiService";
import specificServiceEndPoints from '../services/specificServiceEndPoints';
import ProjectForm from './ProjectForm.vue';
import ConfirmDialog from './Common/ConfirmDialog.vue';
import PaymentsDialog from './PaymentsDialog.vue'

export default {
	name: "project-list",
	components: { ProjectForm, ConfirmDialog, PaymentsDialog },
	data() {
		return {
			projects: [],
			expanded: [],
			paymentToUpdate: null,
			supplierPayments: {},
			showPaymentsDialog: false,
			showMessage: false,
			message: '',
			headers: [
				{ text: 'הוצאות', value: 'payed', align:'end' },
				// { text: 'הכנסות', value: 'budget', align:'end' },
				{ text: 'פרויקט', value: 'project', align:'end' },
				{ text: '', value: 'controls' },
			],
			supplierHeaders: [
				{ text: 'Supplier', value: 'supplier' },
				// { text: 'Budget', value: 'budget', align:'end' },
				{ text: 'Payed', value: 'payed', align:'end' },
				// { text: '', value: 'controls' },
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

		async updateProject(item) {
			let newProject = item ? false : true;
			await this.$refs.projectForm.open(item, newProject);
			this.getProjects();
		},

		async deleteProject(id) {
			try {
				if(id) {
					if(await this.$refs.confirm.open( "Confirm", "Are you sure to delete this project?")){
						let params = {model:PROJECT_MODEL, id:id}
						await apiService.deleteOne(params)
						this.getProjects();
					}
				}
			} catch (error) {
				console.log(error);		
			}
		},

		onSupplierSelect(supplier) {
			this.supplierPayments = supplier.payments;
			this.showPaymentsDialog = true;
		},

		onClosePaymentDialog() {
			this.showPaymentsDialog = false;
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

.expanded-datatable{
	width: 100%;
    margin: 12px;
    border: 10px solid #98e983;
	cursor: pointer;
}

.v-data-table__expanded{
	text-align: -webkit-center;
}

.payments-dialog{
	height: 100%;
	background: #FFF;
}
</style>

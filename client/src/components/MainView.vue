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
					item-key="name"
					show-expand
					single-expand
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
							</v-data-table>
						</td>
					</template>
					<template v-slot:[`item.budget`]="{ item }">
						{{item.budget.toLocaleString()}}
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

		<!-- View payments of supplier -->
		<v-dialog
			v-model="supplierPaymentsDialog"
			class="payments-dialog"
		>
			<v-card>
				<v-data-table
				:headers="paymentsHeaders"
				disable-pagination
				hide-default-footer
				fixed-header
				height="75vh"
				:items="selectedSupplier.payments"
				mobile-breakpoint="0"
				>
					<template v-slot:top>
						<v-toolbar flat>
							<v-toolbar-title>תשלומים 
									{{selectedSupplier.payments[0].project}} - 
									{{selectedSupplier.payments[0].supplier}} -
									<!-- {{selectedSupplier.total.toLocaleString()}} -->
							</v-toolbar-title>
							<v-spacer></v-spacer>
						</v-toolbar>
					</template>
					<template v-slot:[`item.date`]="{ item }">
						<span>{{ new Date(item.date).toLocaleDateString('he-EG') }}</span>
					</template>
					<template v-slot:[`item.amount`]="{ item }">
						{{item.amount.toLocaleString()}}
					</template>
					<template v-slot:[`item.controls`]="{ item }">
						<v-btn @click="paymentToUpdate = item" x-small>
							<v-icon small>mdi-pencil</v-icon>
						</v-btn>
                        <v-btn x-small @click="deletePayment(item._id)">
                            <v-icon small >mdi-delete</v-icon>
                        </v-btn>
					</template>
            </v-data-table>
			</v-card>
		</v-dialog>

		<!-- -------------------- -->
		<template v-if="paymentToUpdate">
			<Payment 
				:onPaymentFormClose="onPaymentFormClose" 
				title="Update Payment" 
				:paymentToUpdate="paymentToUpdate" 
			/>
		</template>
		<confirm-dialog ref="confirm"/>
		<project-form ref="projectForm"/>
	</div>
</template>



<script>
import { PAYMENT_MODEL } from "../constants/constants";
import apiService from "../services/apiService";
import ConfirmDialog from './Common/ConfirmDialog.vue';
import specificServiceEndPoints from '../services/specificServiceEndPoints';
import Payment from "./PaymentForm.vue";
import ProjectForm from './ProjectForm.vue';

export default {
	name: "main-view",
	components: { ConfirmDialog, Payment, ProjectForm },
	data() {
		return {
			projects: [],
			expanded: [],
			paymentToUpdate: null,
			selectedSupplier: {},
			supplierPaymentsDialog: false,
			showMessage: false,
			message: '',
			headers: [
				{ text: 'Name', value: 'name', align:'end' },
				{ text: 'Budget', value: 'budget', align:'end' },
				// { text: 'Payed', value: 'total', align:'end' },
				// { text: 'Date Created', value: 'createdAt' },
				{ text: 'Controls', value: 'controls' },
			],
			supplierHeaders: [
				{ text: 'Supplier', value: 'supplier' },
				// { text: 'Budget', value: 'budget', align:'end' },
				{ text: 'Payed', value: 'payed', align:'end' },
			],
			paymentsHeaders: [
				// { text: 'Project', value: 'project' },
				// { text: 'Vat', value: 'vat' },
				// { text: 'Payment Method', value: 'paymentMethod' },
				{ text: 'Date', value: 'date' },
				{ text: 'Amount', value: 'amount', align:'end'},
				{ text: 'Remarks', value: 'remark', align:'end' },
				{ text: 'Controls', value: 'controls' },
				// { text: 'Supplier', value: 'supplier' },
				// { text: 'Invoice ID', value: 'invoiceId' },
			]
		}
	},

	methods: {
		async getProjects() {
			try {
				const response = await specificServiceEndPoints.retrieveAllProjectsData();
				if(response.data && response.data.success) {
					this.projects = response.data.projects;
					console.log(this.projects)
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
					if(await this.$refs.confirm.open( "Confirm", "Are you sure to delete this project? This will also delete all related payments")){
						await specificServiceEndPoints.deleteProjectAndCorrespondingData(id);
						this.getProjects();
					}
				}
			} catch (error) {
				console.log(error);		
			}
		},

		onSupplierSelect(supplier) {
			this.selectedSupplier = supplier;
			this.supplierPaymentsDialog = true;
		},

		async deletePayment(id) {
            try {
                if (await this.$refs.confirm.open( "Confirm", "Are you sure you want to delete this item?")) {
                    await apiService.deleteOne({ model: PAYMENT_MODEL , id});
					window.location.reload();
                }
            } catch (error) {
                console.log(error);
            }
        },

		onPaymentFormClose() {
            this.paymentToUpdate = null;
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
	width: 90%;
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

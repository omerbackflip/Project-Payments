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
					<template v-slot:expanded-item="{item }">

						<td :colspan="headers.length">
							<v-data-table 
								:headers="supplierHeaders"
								:items="item.suppliers"
								dense
								disable-pagination
								hide-default-footer
								@click:row="onSupplierSelect"
								class="expanded-datatable">
								<template v-slot:[`item.budget`]="{ item }">
									<span>{{ item.budget || 0 }}</span>
								</template>
							</v-data-table>
						</td>

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

		<!-- Add/Update Project -->
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

		<!-- ----------------------- -->


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
				:items="selectedSupplier.payments"
				>

					<template v-slot:top>
						<v-toolbar flat>
							<v-toolbar-title>All Payments</v-toolbar-title>
							<v-spacer></v-spacer>
						</v-toolbar>
					</template>
					<template v-slot:[`item.date`]="{ item }">
						<span>{{ new Date(item.date).toDateString() }}</span>
					</template>

					<template v-slot:[`item.controls`]="{ item }">
						<v-btn @click="paymentToUpdate = item" x-small>
							<v-icon small>mdi-pencil</v-icon>
						</v-btn>
                        <v-btn x-small @click="deletePayment(item.id)">
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
	</div>
</template>



<script>
import { PAYMENT_MODEL, PROJECT_MODEL } from "../constants/constants";
import apiService from "../services/apiService";
import ConfirmDialog from './Common/ConfirmDialog.vue';
import specificServiceEndPoints from '../services/specificServiceEndPoints';
import Payment from "./Payment.vue";

export default {
	name: "main-view",
	components: { ConfirmDialog, Payment },
	data() {
		return {
			projects: [],
			project: {
				budget: '',
				name: '',
			},
			expanded: [],
			update: 0,
			paymentToUpdate: null,
			dialog: false,
			selectedSupplier: {},
			supplierPaymentsDialog: false,
			showMessage: false,
			message: '',
			headers: [
				{ text: 'Name', value: 'name' },
				{ text: 'Budget', value: 'budget' },
				{ text: 'Date Created', value: 'createdAt' },
				{ text: 'Controls', value: 'controls' },
			],
			supplierHeaders: [
				{ text: 'Supplier Name', value: 'name' },
				{ text: 'Supplier Budget for project', value: 'budget' },
			],
			paymentsHeaders: [
				{ text: 'Project', value: 'project' },
				{ text: 'Amount', value: 'amount' },
				{ text: 'Vat', value: 'vat' },
				{ text: 'Payment Method', value: 'paymentMethod' },
				{ text: 'Remarks', value: 'remark' },
				{ text: 'Supplier', value: 'supplier' },
				{ text: 'Invoice ID', value: 'invoiceId' },
				{ text: 'Date', value: 'date' },
				{ text: 'Controls', value: 'controls' },
			]
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
		updateProject(item) {
			this.project = {name: item.name , budget: item.budget};
			this.dialog = true;
			this.update = item.id;
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
                console.log(id);
                if (await this.$refs.confirm.open( "Confirm", "Are you sure you want to delete this item?")) {
                    await apiService.deleteOne({ model: PAYMENT_MODEL , id});
                    this.retrievePayments();
                }
            } catch (error) {
                console.log(error);
            }
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

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
					:items="suppliers"
					mobile-breakpoint="0"
					:expanded.sync="expanded"
					item-key="name"
					show-expand
					single-expand
				>
					<template v-slot:top>
						<v-toolbar flat>
							<v-toolbar-title>All Suppliers</v-toolbar-title>
							<v-spacer></v-spacer>
							<v-btn @click="dialog = true">
								<v-icon class="nav-icon" small >mdi-plus</v-icon>
								New Supplier
							</v-btn>
						</v-toolbar>
					</template>

					<template v-slot:expanded-item="{item}">
						<td :colspan="headers.length">
							<v-data-table 
								:headers="projectHeaders"
								:items="item.projects"
								@click:row="onProjectSelect"
								dense
								disable-pagination
								hide-default-footer
								mobile-breakpoint="0"
								class="expanded-datatable">
							</v-data-table>
						</td>
					</template>


					<template v-slot:[`item.controls`]="{ item }">
						<v-btn @click="updateSupplier(item)" x-small>
							<v-icon small>mdi-pencil</v-icon>
						</v-btn>
						<v-btn class="ml-1" @click="deleteSupplier(item._id)" x-small>
							<v-icon small>mdi-delete</v-icon>
						</v-btn>
					</template>
				</v-data-table>
			</v-card>
		</v-layout>

		<v-dialog v-model="dialog" width="500">
			<v-card>
				<v-card-title class="text-h5 grey lighten-2">
					{{!update ? 'New' : 'Update'}} Supplier
				</v-card-title>
				<div class="field-margin" v-show="showMessage">
					{{message}}
				</div>
				<v-text-field class="field-margin" v-model="supplier.name" label="Name"></v-text-field>
				<v-text-field class="field-margin" v-model="supplier.budget" label="Budget"></v-text-field>

				<v-divider></v-divider>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="primary" text @click="dialog = false"> Close </v-btn>
					<v-btn :disabled = "!supplier.name" color="primary" text @click="submitSupplier()"> Submit </v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<confirm-dialog ref="confirm"/>

			<!-- View payments of supplier -->
		<v-dialog
			v-model="projectPaymentsDialog"
			class="payments-dialog"
		>
			<v-card>
				<v-data-table
				:headers="paymentsHeaders"
				disable-pagination
				hide-default-footer
				fixed-header
					height="75vh"
				:items="selectedProject.payments"
				mobile-breakpoint="0"
				>
					<template v-slot:top>
						<v-toolbar flat>
							<v-toolbar-title>תשלומים </v-toolbar-title>
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
	</div>

	
</template>



<script>
import { PAYMENT_MODEL, SUPPLIER_MODEL } from "../constants/constants";
import apiService from "../services/apiService";
import specificServiceEndPoints from '../services/specificServiceEndPoints';
import ConfirmDialog from './Common/ConfirmDialog.vue';
import Payment from "./PaymentForm.vue";

export default {
	name: "supplier-list",
	components: { ConfirmDialog,Payment },
	data() {
		return {
			suppliers: [],
			supplier: {
				budget: '',
				name: '',
			},
			update: 0,
			paymentToUpdate: null,
			dialog: false,
			projectPaymentsDialog: false,
			selectedProject: {},
			showMessage: false,
			message: '',
			headers: [
				{ text: 'Name', value: 'name' },
				{ text: 'Budget', value: 'totalBudget' },
				// { text: 'Date Created', value: 'createdAt' },
				{ text: 'Controls', value: 'controls' },
			],
			projectHeaders: [
				{ text: 'Project', value: 'project'},
				{ text: 'Budget', value: 'budget', align:'end' },
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
			],
			expanded: [],
		}
	},

	methods: {
		async getSuppliers() {
			try {
				const response = await specificServiceEndPoints.retrieveAllSuppliersData();
				if(response && response.data) {
					this.suppliers = response.data.suppliers
					console.log(this.suppliers)
				}
			} catch (error) {
				console.log(error);
			}
		},
		async deletePayment(id) {
            try {
                if (await this.$refs.confirm.open( "Confirm", "Are you sure you want to delete this item?")) {
                    await apiService.deleteOne({ model: PAYMENT_MODEL , id});
                    this.getSuppliers();
                }
            } catch (error) {
                console.log(error);
            }
        },
		onProjectSelect(project) {
			this.selectedProject = project;
			this.projectPaymentsDialog = true;
		},
		updateSupplier(item) {
			this.supplier = {name: item.name , budget: item.budget};
			this.dialog = true;
			this.update = item._id;
		},
		async deleteSupplier(id) {
			try {
				if(id) {
					if(await this.$refs.confirm.open( "Confirm", "Are you sure to delete this supplier? This will also delete all related payments")){
						await apiService.deleteOne({ id , model: SUPPLIER_MODEL});
						this.getSuppliers();
					}
				}
			} catch (error) {
				console.log(error);		
			}
		},
		onPaymentFormClose() {
            this.paymentToUpdate = null;
        },
		async submitSupplier() {
			try {
				let response;
				if(!this.update) {
					response = await apiService.create(this.supplier , {model:SUPPLIER_MODEL});
				} else {
					response = await apiService.update(this.update , this.supplier , {model:SUPPLIER_MODEL});
				}
				if(response.data) {
					this.message = 'Supplier successfully created/updated!';
					this.showMessage = true;
					this.getSuppliers();
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
		this.getSuppliers();
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

</style>

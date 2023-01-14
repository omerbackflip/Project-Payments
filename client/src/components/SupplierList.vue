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
					item-key="supplier"
					show-expand
					single-expand
				>
					<template v-slot:top>
						<v-toolbar flat>
							<v-toolbar-title>קבלנים - {{suppliers.length}}</v-toolbar-title>
							<v-spacer></v-spacer>
							<v-btn @click="dialog = true" small>
								<v-icon class="nav-icon" small >mdi-plus</v-icon>
								הוספת קבלן
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
								<template v-slot:[`item.payed`]="{ item }">
									<span>{{ item.payed ? item.payed.toLocaleString() : 0 }} </span>
								</template>
								<!-- <template v-slot:[`item.controls`]="{ item }">
									<PaymentsDialog :payments="item.payments"/>
								</template> -->
							</v-data-table>
						</td>
					</template>	
					<template v-slot:[`item.controls`]="{ item }">
						<v-btn @click="updateSupplier(item)" x-small>
							<v-icon small>mdi-pencil</v-icon>
						</v-btn>
						<v-btn class="ml-1" @click="deleteSupplier(item)" x-small>
							<v-icon small>mdi-delete</v-icon>
						</v-btn>
					</template>
					<template v-slot:[`item.payed`]="{ item }">
						{{item.payed ? item.payed.toLocaleString() : 0 }}
					</template>
				</v-data-table>
			</v-card>
		</v-layout>

		<!-- dialog for Update/New supplier -->
		<v-dialog v-model="dialog" width="500">
			<v-card>
				<v-card-title class="text-h5 grey lighten-2">
					{{supplier.supplier ? 'Update' : 'New'}} Supplier
				</v-card-title>
				<div class="field-margin" v-show="showMessage">
					{{message}}
				</div>
				<v-text-field class="field-margin" v-model="supplier.supplier" label="Supplier Name"></v-text-field>
				<v-divider></v-divider>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="primary" text @click="onDialogSupplierClose()"> Close </v-btn>
					<v-btn :disabled = "!supplier" color="primary" text @click="submitSupplier()"> Submit </v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<confirm-dialog ref="confirm"/>
		<div>
			<PaymentsDialog :payments="projectPayments" :showPaymentsDialog="showPaymentsDialog" :total="projectPayed" @close="onClosePaymentDialog"/>
		</div>
	</div>

	
</template>



<script>
import { PAYMENT_MODEL, TABLE_MODEL } from "../constants/constants";
import apiService from "../services/apiService";
import specificServiceEndPoints from '../services/specificServiceEndPoints';
import ConfirmDialog from './Common/ConfirmDialog.vue';
import PaymentsDialog from './PaymentsDialog.vue'

export default {
	name: "supplier-list",
	components: { ConfirmDialog, PaymentsDialog },
	data() {
		return {
			suppliers: [],
			supplier: {
				supplier: '',
				id: '',	// if there is supplier.id --> means "update"
			},
			paymentToUpdate: null,
			dialog: false,
			showPaymentsDialog: false,
			projectPayments: {},
			projectPayed: 0,
			showMessage: false,
			message: '',
			headers: [
				{ text: 'שולם', value: 'payed', align:'end' },
				// { text: 'תקציב', value: 'totalBudget', align:'end' },
				{ text: 'קבלן', value: 'supplier', align:'end' },
				{ text: '', value: 'controls' },
			],
			projectHeaders: [
				{ text: 'Payed', value: 'payed', align:'end' },
				{ text: 'Budget', value: 'budget', align:'end' },
				{ text: 'Project', value: 'project', align:'end'},
				// { text: '', value: 'controls' },
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
					if (response.data.success != true ) {
						window.alert(response.data.success)
					}
				} 	// now suppliers is array which includes "supplier" + "id" from TABLE + "projects" (Array)
					// reason for the "id" is to be able to destinguish between "create" or "update"
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
			this.projectPayed = project.payed;
			this.projectPayments = project.payments;
			this.showPaymentsDialog = true;
		},
		updateSupplier(item) {
			this.supplier = {id: item.id, supplier: item.supplier};
			this.dialog = true;
		},
		async deleteSupplier(supplier) {
			try {
				if(supplier) { 
					if(await this.$refs.confirm.open( "Confirm Delete Supplier", "Are you sure to delete this supplier?")){
						let id = supplier.id
						await apiService.deleteOne({ id , model: TABLE_MODEL});
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
		onDialogSupplierClose() {
			this.supplier.supplier = '';
			this.supplier.id = '';
			this.dialog = false;
        },
		async submitSupplier() {
			try {
				let response;
				let thisSupp = {description: this.supplier.supplier, table_id: 1};
				if(this.supplier.id) { // if there is supplier.id --> means "update" 
					response = await apiService.update(this.supplier.id, thisSupp, {model:TABLE_MODEL});
					// need to add update supplier to relevant PAYMENTS
				} else {	// if there is NO supplier.id --> means "create"
					response = await apiService.create(thisSupp, {model:TABLE_MODEL});
				}
				if(response.data) {
					this.message = 'Supplier successfully created/updated!';
					this.showMessage = true;
					this.getSuppliers();
					this.supplier.supplier = '';
					this.supplier.id = '';
					setTimeout(() => {
						this.dialog = false;
						this.showMessage = false;
					}, 1000);
				}
			} catch (error) {
				console.log(error);
			}
		},
		onClosePaymentDialog() {
			this.showPaymentsDialog = false;
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
	width: 100%;
    margin: 12px;
    border: 10px solid #98e983;
	cursor: pointer;
}

</style>

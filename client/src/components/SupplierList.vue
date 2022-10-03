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
					<template v-slot:[`item.createdAt`]="{ item }">
						<span>{{ new Date(item.createdAt).toLocaleString() }}</span>
					</template>

					<template v-slot:[`item.controls`]="{ item }">
						<v-btn @click="updateSupplier(item)" x-small>
							<v-icon small>mdi-pencil</v-icon>
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

	</div>
</template>



<script>
import { SUPPLIER_MODEL } from "../constants/constants";
import apiService from "../services/apiService";

export default {
	name: "supplier-list",
	data() {
		return {
			suppliers: [],
			supplier: {
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
		async getSuppliers() {
			try {
				const response = await apiService.get({model: SUPPLIER_MODEL});
				this.suppliers = response.data;
			} catch (error) {
				console.log(error);
			}
		},
		updateSupplier(item) {
			this.supplier = {name: item.name , budget: item.budget};
			this.dialog = true;
			this.update = item.id;
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
</style>

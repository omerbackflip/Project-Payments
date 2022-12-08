<template >    
    <v-dialog
        v-model="paymentsDialog"
        class="payments-dialog"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" x-small>פירוט</v-btn>
        </template>
        <v-card>
				<v-data-table
				:headers="paymentsHeaders"
				disable-pagination
				hide-default-footer
				fixed-header
				height="55vh"
				:items="payments"
				mobile-breakpoint="0"
				>
					<template v-slot:top>
						<v-toolbar flat>
							<v-toolbar-title>
                                תשלומים - {{payments[0].project}} - {{payments[0].supplier}}
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
			<v-btn small @click="paymentsDialog = false">close</v-btn>
        </v-card>

        <template v-if="paymentToUpdate">
			<Payment 
				:onPaymentFormClose="onPaymentFormClose" 
				title="Update Payment" 
				:paymentToUpdate="paymentToUpdate" 
			/>
		</template>
		<confirm-dialog ref="confirm"/>
    </v-dialog>

</template>

<script>
import { PAYMENT_MODEL } from "../constants/constants";
import apiService from "../services/apiService";
import ConfirmDialog from './Common/ConfirmDialog.vue';
import Payment from "./PaymentForm.vue";
export default {
    props: ['payments'],
	components: { ConfirmDialog, Payment    },
    data(){
        return {
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
            paymentsDialog: false,
			paymentToUpdate: null,
        }
    },

    methods: {
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
        },
    },
    async mounted() {
        // console.log(this.payments)
    }
}
</script>
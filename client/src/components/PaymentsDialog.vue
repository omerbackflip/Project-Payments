<template>
    <v-dialog v-model="showPaymentsDialog"  @click:outside="closeDialog">
        <v-card >
				<v-data-table
				:headers="paymentsHeaders"
				:items="payments"
				disable-pagination
				hide-default-footer
				fixed-header
				mobile-breakpoint="0"
				>
					<template v-slot:top>
						<v-toolbar flat>
							<v-toolbar-title>
                                {{total.toLocaleString()}} - {{payments[0].project}} - {{payments[0].supplier}}
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
			<v-btn small @click="closeDialog()">close</v-btn>
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
    props: ['payments', 'showPaymentsDialog', 'total'],
	components: { ConfirmDialog, Payment },
    data(){
        return {
            paymentsHeaders: [
                { text: 'Date', value: 'date' },
                { text: 'Amount', value: 'amount', align:'end'},
                { text: 'Remarks', value: 'remark', align:'end' },
                { text: 'Controls', value: 'controls' },
			],
			paymentToUpdate: null,
            dialogOpen: false
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
        closeDialog() {
            this.$emit('close')
        }
    },
    async mounted() {
    },
}
</script>

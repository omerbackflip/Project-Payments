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
    </v-dialog>

</template>

<script>
export default {
    props: ['payments'],
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
        }
    }
    
}
</script>
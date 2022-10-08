<template>
    <v-dialog v-model="dialog" max-width="600px">
        <v-card>
            <v-card-title>
                <h2>{{title}}</h2>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="4" sm="6" md="4">
                            <v-text-field v-model="payment.amount" label="Amount"></v-text-field>
                        </v-col>
                        <v-col cols="4">
                            <v-text-field v-model="payment.vat" label="vat"></v-text-field>
                        </v-col>
                        <v-col cols="4">
                            <v-text-field v-model="payment.total" label="total"></v-text-field>
                        </v-col>          
                        <v-col cols="4">
                            <v-dialog ref="dialog" v-model="dateModal" :return-value.sync="payment.date" persistent width="290px">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field 
                                    v-model="payment.date"
                                    label="תאריך"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on" >
                                    </v-text-field>
                                </template> 
                                <v-date-picker v-model="payment.date" scrollable>
                                    <v-spacer></v-spacer>
                                    <v-btn text color="primary" @click="dateModal = false">Cancel</v-btn>
                                    <v-btn text color="primary" @click="$refs.dialog.save(payment.date)">OK</v-btn>
                                </v-date-picker>
                            </v-dialog>
                        </v-col>
                        <v-col cols="4">
                            <v-select class="mt-6"
                                :items="currentSuppliers"
                                v-model="payment.supplier"
                                label="Supplier"
                                dense
                            ></v-select>
                        </v-col>   
                        <v-col cols="4">
                            <v-text-field v-model="payment.invoiceId" label="Invoice"></v-text-field>
                        </v-col>
                        <v-col cols="4">
                            <v-select class="mt-6"
                                :items="projects"
                                v-model="payment.project"
                                label="Project"
                                dense
                            ></v-select>
                        </v-col>
                        <v-col cols="4">
                            <v-text-field v-model="payment.payMethod" label="credit"></v-text-field>
                        </v-col>
                        <v-col cols="4">
                            <v-text-field v-model="payment.clear" label="clearance"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model="payment.remark" label="Remark"></v-text-field>
                        </v-col>                           
                    </v-row>
                </v-container>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="dialog=false">close</v-btn>
                <v-btn color="primary" @click="savePayment()">Save</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { PAYMENT_MODEL, PROJECT_MODEL, SUPPLIER_MODEL } from '../constants/constants';
import apiService from "../services/apiService";
export default {
    name: "payment",
    props:['title','paymentToUpdate','supplierList','onPaymentFormClose'],
    data () {
      return {
        payment: {
          project:      "",
          clear:        null,
          amount:       null,
          vat:          null,
          total:        null,
          payMethod:    "",
          date:         null,
          supplier:     "",
          invoiceId:    "",
          remark:       "",
        },  
        projects: [],
        dialog: false,
        currentSuppliers: [],
        dateModal : false,
      }
    },
    methods: {
        async savePayment() {
            try {
                if (this.paymentToUpdate) {
                    apiService.update(this.payment.id, this.payment, {model: PAYMENT_MODEL });
                } else {
                    apiService.create(this.payment , {model: PAYMENT_MODEL , middleware: 'addPaymentToSupplierMiddleWare'});
                }
            this.dialog = false;   
            } catch (error) {
                console.log(error);
            }
        },
        async getAllProjectsAndSuppliers() {
            try {
                const [projects,suppliers] = await Promise.all([
                    apiService.get({model: PROJECT_MODEL}),
                    apiService.get({model: SUPPLIER_MODEL}),
                ]);
                this.projects = projects.data.map(project => project.name);
                this.currentSuppliers = suppliers.data.map(supplier => supplier.name);
            } catch (error) {
                console.log(error);
            }
        }
    },

    mounted() {
        this.getAllProjectsAndSuppliers();
		this.payment = this.paymentToUpdate ?  this.paymentToUpdate : {};
        this.dialog = true;
        console.log("Payment.vue is mounted"); 
	},
     watch:{
        dialog:function(newValue){
            if(!newValue){
                this.onPaymentFormClose();
            }
        }
    }
}
</script>
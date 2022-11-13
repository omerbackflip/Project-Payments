<template>
    <v-dialog v-model="dialog" max-width="600px">
        <v-card>
            <v-card-title>
                <h2>{{title}} {{!paymentToUpdate ? ' - New Payment' : ''}}</h2>
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
                                :items="suppliers"
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
                            <v-text-field v-model="payment.paymentMethod" label="credit"></v-text-field>
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
                <v-btn color="primary" @click="copyPayment()" v-show="paymentToUpdate">Copy</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
// import { PAYMENT_MODEL, PROJECT_MODEL, SUPPLIER_MODEL, TABLE_MODEL } from '../constants/constants';
import { PAYMENT_MODEL, TABLE_MODEL } from '../constants/constants';
// import moment from 'moment';
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
          paymentMethod:    "",
          date:         null,
          supplier:     "",
          invoiceId:    "",
          remark:       "",
        },  
        projects: [],
        suppliers: [],
        dialog: false,
        dateModal : false,
        disabled: false,
      }
    },
    methods: {
        async savePayment() {
            try {
                if (this.paymentToUpdate) {
                    apiService.update(this.payment._id, this.payment, {model: PAYMENT_MODEL });
                } else {
                    // Dont need this since changes in Project table
                    // apiService.create(this.payment , {model: PAYMENT_MODEL , middleware: 'addPaymentToSupplierMiddleWare'});
                    apiService.create(this.payment , {model: PAYMENT_MODEL});
                }
                window.location.reload();
                this.dialog = false;   
            } catch (error) {
                console.log(error);
            }
        },
        async getAllProjectsAndSuppliers() {
            try {
                // const [projects,suppliers] = await Promise.all([
                //     apiService.get({model: PROJECT_MODEL}),
                //     apiService.get({model: SUPPLIER_MODEL}),
                // ]);
                // this.projects = projects.data.map(project => project.name);
                // this.suppliers = suppliers.data.map(supplier => supplier.name);

                const [projects,suppliers] = await Promise.all([
                    apiService.get({model: TABLE_MODEL , table_id : 2}), // get projects list from TABLE
                    apiService.get({model: TABLE_MODEL , table_id : 1}), // get suppliers list from TABLE
                ]);
                this.projects = projects.data.map(project => project.description);
                this.suppliers = suppliers.data.map(supplier => supplier.description);
            } catch (error) {
                console.log(error);
            }
        },
        copyPayment(){
            this.paymentToUpdate = null;
            delete this.payment._id ;
            this.disabled = true
        }
    },

    mounted() {
        this.getAllProjectsAndSuppliers();
		this.payment = this.paymentToUpdate ?  this.paymentToUpdate : {};
        this.payment.date = this.paymentToUpdate ? (new Date(this.payment.date)).toISOString().substr(0, 10) : '';
        this.dialog = true;
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
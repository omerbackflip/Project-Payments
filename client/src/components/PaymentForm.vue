<template>
    <v-dialog v-model="dialog" max-width="600px">
        <v-card>
            <v-card-title>
                <h2>{{title}} {{copyMode ? ' - Copy Mode' : ''}}</h2>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="4">
                            <v-select class="mt-6"
                                :items="projects"
                                v-model="payment.project"
                                label="Project"
                                dense
                            ></v-select>
                        </v-col>
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
                <v-btn color="primary" small @click="dialog=false">close</v-btn>
                <v-btn color="primary" small @click="savePayment()">Save</v-btn>
                <v-btn color="primary" small @click="copyPayment()" v-show="!copyMode">Copy</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { PAYMENT_MODEL, TABLE_MODEL, PROJECT_MODEL } from '../constants/constants';
// import moment from 'moment';
import apiService from "../services/apiService";
import specificServiceEndPoints from '../services/specificServiceEndPoints';

export default {
    name: "Payment",
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
        copyMode: false,
      }
    },
    methods: {
        async savePayment() {
            try {
                if (this.payment._id) {
                    apiService.update(this.payment._id, this.payment, {model: PAYMENT_MODEL });
                } else {
                    apiService.create(this.payment , {model: PAYMENT_MODEL});
                }
                // in case of new supplier in this project - needs to add supplier to PROJECT table
                const currProj = await apiService.get({model: PROJECT_MODEL, project: this.payment.project})
                const findSupp = currProj.data[0].suppliers.find((item) =>{
                    return item.supplier === this.payment.supplier
                })
                if(!findSupp) { // Add this supplier to PROJECT table
                    // console.log(currProj.data[0]._id)
                    await specificServiceEndPoints.addProjectBudgetsToSupplier(
                        currProj.data[0]._id, 
                        [...currProj.data[0].suppliers, {supplier: this.payment.supplier, budget: 0}]
                    );
                }
                window.location.reload();
                this.dialog = false;   
            } catch (error) {
                console.log(error);
            }
        },
        async getAllProjectsAndSuppliers() {
            try {
                const [projects,suppliers] = await Promise.all([
                    apiService.get({model: PROJECT_MODEL}), // get projects list from PROJECT
                    apiService.get({model: TABLE_MODEL , table_id : 1}), // get suppliers list from TABLE
                ]);
                this.projects = projects.data.map(project => project.project);
                this.suppliers = suppliers.data.map(supplier => supplier.description);
            } catch (error) {
                console.log(error);
            }
        },
        copyPayment(){
            delete this.payment._id ;
            this.copyMode = true
        },
    },

    mounted() {
        this.getAllProjectsAndSuppliers();
		this.payment = this.paymentToUpdate ?  this.paymentToUpdate : {};
        // this.payment.date = this.paymentToUpdate ? (new Date(this.payment.date)).toISOString().substr(0, 10) : '';
        // this.payment.date = this.paymentToUpdate ? (new Date(this.payment.date)).toLocaleDateString('he-EG') : new Date().toLocaleDateString('he-EG');
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
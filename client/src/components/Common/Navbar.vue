<template>
    <nav>
        <v-app-bar app dark>
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <v-spacer></v-spacer>
            <v-select class="mt-6"
                :items="supplierList"
                @change="onChangeSupplier"
                v-model="selectedSupplier"
                label="Supplier"
            ></v-select>
            <v-row class="margin-summary">
                <v-col class="summary">
                    Budget = {{budget && budget.toLocaleString() || 'N/A'}}
                    <span>{{'  '}}|{{'  '}}</span>
                    Paid = {{total && total.toLocaleString() || 'N/A'}}
                    <span>{{'  '}}|{{'  '}}</span>
                    Budget Left = {{ budget && total && (budget-total).toLocaleString() || 'N/A'}}
                </v-col>
            </v-row>
            <payments-list @getData = "getValues" :noData = "true" />

            <v-btn icon>
                <v-icon class="nav-icon" small @click="dialog = true">mdi-plus</v-icon>
            </v-btn>
            <v-btn icon>
                <v-icon class="nav-icon" small @click="deleteAllPayments()">mdi-delete</v-icon>
            </v-btn>

        </v-app-bar>

        <v-navigation-drawer app v-model="drawer" class="primary text-left ">
            <v-list class="ml-1">
                <v-list-item v-for="link in links" :key="link.text" router @click="navigate(link)">
                    <v-list-item-action>
                        <v-icon class="white--text">{{link.icon}}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title class="white--text">{{link.text}}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <template v-if="openImportModal">
            <ImportPayments :openImportModal="openImportModal" :setImportModal="toggleModal" />
        </template>
        <template v-if="dialog">
            <Payment :onPaymentFormClose="onPaymentFormClose" :supplierList="supplierList" title="New Payment" :paymentToUpdate="null"/>
        </template>
        <confirm-dialog ref="confirm"/>
    </nav>
    
</template>

<script>
import { PAYMENT_MODEL } from '../../constants/constants';
import apiService from '../../services/apiService';
import ConfirmDialog from './ConfirmDialog.vue';
import ImportPayments from '../ImportPayments.vue';
import Payment from '../Payment.vue';
import PaymentsList from '../PaymentsList.vue';

export default {
    components: { ImportPayments,Payment, PaymentsList, ConfirmDialog },
    data() {
        return {
            drawer: false,
            openImportModal: false,
            links: [
                {icon: 'mdi-view-dashboard', text: 'Main View', route: '/'},
                {icon: 'mdi-cash-multiple', text: 'Payments', route: '/payments'},
                {icon: 'mdi-arrow-up-bold-box-outline', text: 'Import payments', route: null , onClick: this.toggleModal},
                {icon: 'mdi-briefcase-check', text: 'Project list', route: '/project-list'},
                {icon: 'mdi-account-multiple-check', text: 'Supplier list', route: '/supplier-list'},
                {icon: 'mdi-file-table-box-multiple', text: 'Table list', route: '/tableList'},
            ],
            supplierList : ['All'],
            selectedSupplier : "All",
            total: '',
            dialog: false,
            count: '',
            budget: '',
        }
    },
    methods:{
        onYearChange(event) {
            this.$root.$emit('yearChange',event);
        },
        onChangeSupplier(event) {
            this.$root.$emit('onSupplierChange',event);
        },
        toggleModal() {
            this.openImportModal = !this.openImportModal;
            console.log(this.openImportModal);
        },
        getValues(count,total, supplierList) {
            if(supplierList) {
                this.supplierList = [...this.supplierList , ...supplierList];
            }
            this.total = total || this.total;
            this.count = count || this.count;
        },
        navigate(link) {
            if(link && link.route) {
                this.$router.push({ path: link.route });
            } else {
                link.onClick();
            }
        },
        onPaymentFormClose() {
            this.dialog = false;
        },
        async deleteAllPayments() {
            if(await this.$refs.confirm.open( "Confirm", "Are you sure you want to delete all supplier's payments?")) {
                await apiService.deleteAll({model: PAYMENT_MODEL});
                window.location.reload();
            }
        }
    },
    computed: {
    }
}
</script>

<style scoped>
    .plus-button{
        font-size: 29px !important;
        padding-top: 0px;
        padding-left: 15px;
        border: 1px solid;
        margin-top: 8px;
        margin-left: 15px;
        height: 42px !important;
    }
    .year-input{
        padding: 0;
        border: 1px solid;
        margin-top: 7px;
        color: white;
        font-size: 12px;
    }
    .year-input:nth-child(1){
        height: 42px !important;
    }
    .cursor-pointer{
        cursor: pointer ;
    }

    .v-input__slot {
      max-width: 100px;
      max-height: 60px;
    }

    .v-toolbar__content{
        height: 70px !important;
        padding-right: 1px !important;
        padding-left: 1px !important;
    }

    .summary {
        font-size: small;
    }

    .v-application p {
        margin-bottom: 4px;
    }
    .v-select{
        width: 20% !important;
        max-width: 20% !important;
        margin-top: 34px !important;
    }

    .nav-icon{
        background: #FFF;
        color: #0d6efd !important;
        border-radius: 4px;
    }

    @media screen
    and (min-width: 350px)
    and (max-width: 768px) {
        .summary{
            font-size: 10px;
        }
        .v-select{
            width: 30% !important;
            max-width: 50% !important;
            margin-top: 34px !important;
        }
    }

    .text-left{
        text-align: left !important;
    }
     

</style>



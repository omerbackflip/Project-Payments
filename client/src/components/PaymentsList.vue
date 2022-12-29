<template>
  <div class="list row">
    <v-layout row wrap>


      <!-- Web-view -->
      <div v-show="!isMobile() && !noData">
        <v-data-table
            :headers="headers"
            disable-pagination
            hide-default-footer
            fixed-header
            height="75vh"
            :items="payments">
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>All Payments</v-toolbar-title>
              <v-spacer></v-spacer>
              <export-excel 
                :data="payments" 
                :fields="xlsHeders"
                type="xlsx"
                name="ALL PAYMENTS"
                title="LIST OF ALL PAYMENTS"
                footer="Here Footer">
                <v-btn x-small>
                  <v-icon small>mdi-download</v-icon>
                </v-btn>
              </export-excel>
            </v-toolbar>
          </template>
          <template v-slot:[`item.date`]="{ item }">
            <span>{{ new Date(item.date).toLocaleDateString('he-EG') }}</span>
          </template>
          <template v-slot:[`item.controls`]="{ item }">
            <v-btn @click="paymentToUpdate = item" x-small>
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
            <v-btn x-small>
                <v-icon small @click="deleteItem(item._id)">mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </div>
      <!-- End-Web-view -->



      <!-- Mobile-view -->
      <v-flex v-show="isMobile()">
        <v-list  v-show="!noData" two-line dense rounded>
          <v-list-item-group v-model="selected" active-class="pink--text">
            <template v-for="(item, index) in payments">
              <v-list-item class="list-styles" :key="item._id">
                <template v-slot:default>
                  <v-list-item-content>
                    <v-list-item-title class="right">
                      {{ item.supplier }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="blue--text">
                      {{ item.amount ? item.amount.toLocaleString() : "" }}
                      {{ item.date ? "("+ new Date(item.date).toLocaleDateString('he-EG') +")" : "???"}}
                    </v-list-item-subtitle>
                    <v-list-item-subtitle>
                      {{ item.invoiceId ? "חשבונית:" + item.invoiceId : "" }}
                      {{ item.paymentMethod ? "(שיק:" + item.paymentMethod + ")" : "" }}
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="right">
                      {{ item.remark ? item.remark : "" }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-list-item-title
                      v-text="item.project"
                    ></v-list-item-title>
                    <v-btn @click="paymentToUpdate = item" x-small>
                        <v-icon small>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn x-small @click="deleteItem(item._id)">
                      <v-icon small 
                        >mdi-delete</v-icon
                      >
                    </v-btn>
                  </v-list-item-action>
                </template>
              </v-list-item>
              <v-divider
                v-if="index < payments.length - 1"
                :key="index"
                style="margin-top: 0px; margin-bottom: 0px"
                color="#0d6efd"
              ></v-divider>
            </template>
          </v-list-item-group>
        </v-list>
      </v-flex>
      <!-- End Mobile-view -->

    </v-layout>
    <template v-if="paymentToUpdate">
        <Payment 
            :onPaymentFormClose="onPaymentFormClose" 
            title="Update Payment" 
            :paymentToUpdate="paymentToUpdate" 
        />
    </template>
    <confirm-dialog ref="confirm"/>
  </div>
</template>

<script>
import { TABLE_MODEL, PAYMENT_MODEL } from '../constants/constants';
import apiService from "../services/apiService";
import Payment from "./PaymentForm.vue";
import ConfirmDialog from './Common/ConfirmDialog.vue';
import Vue from 'vue'
import excel from 'vue-excel-export'
Vue.use(excel)

export default {
    components: { Payment, ConfirmDialog },
    name: "payments-list",
    props: ["noData"],
    data() {
        return {
            payments: [],
            isLoading: true,
            supplierList: [],
            paymentToUpdate: null,
            headers: [
              { text: 'Project', value: 'project' },
              { text: 'Amount', value: 'amount' },
              { text: 'Vat', value: 'vat' },
              { text: 'Payment Method', value: 'paymentMethod' },
              { text: 'Remarks', value: 'remark' },
              { text: 'Supplier', value: 'supplier' },
              { text: 'Invoice ID', value: 'invoiceId' },
              { text: 'Date', value: 'date' },
              { text: 'Controls', value: 'controls' },
            ],
            xlsHeders:{
              "פרויקט"	:"project", 
              "סכום"    :"amount",
              "שיק"     :"paymentMethod",
              "הערה"    :"remark",
              "קבלן"   	:"supplier",
              "חשבונית" :"invoiceId",
              "תאריך"   :"date",
            },
            budget: [],
            selectedSupplier: "All",
            selected: [],
            total: 0,
            count: 0,
        };
    },

    methods: {
        async retrievePayments() {
            try {
                let query;
                if(this.selectedSupplier !== 'All') {
                    query = {supplier: this.selectedSupplier};
                }
                const payments = await apiService.get({ model: PAYMENT_MODEL  , ...query });

                this.payments = payments.data;
                payments.data.forEach((num) => { this.total += (+num.amount) });
                this.count = payments.data && payments.data.length;
                this.$emit("getData", this.count, this.total, null);
                this.$emit("total", this.total, "count", this.count);

            } catch (error) {
                console.log(error);
            }
        },
        async getSuppliersList() {
            try {
              const response = await apiService.get({ model: TABLE_MODEL, table_id: 1});
              this.suppliersList = response.data.map(supplier => supplier.description);
              this.$emit("getData", null, null, this.suppliersList);
            } catch (error) {
                console.log(error);
            }
        },
        async deleteItem(id) {
            try {
                if (await this.$refs.confirm.open( "Confirm", "Are you sure you want to delete this item?")) {
                    await apiService.deleteOne({ model: PAYMENT_MODEL , id});
                    this.retrievePayments();
                }
            } catch (error) {
                console.log(error);
            }
        },
        isMobile() {
            if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                return true
            } else {
                return false
            }
        },
        editItem(id) {
            this.$router.push({ name: "payment", params: { id: id } });
        },
        onPaymentFormClose() {
            this.paymentToUpdate = null;
        }
    },

    async mounted() {
        this.retrievePayments();
        this.getSuppliersList();
        this.isLoading = false;
        this.$root.$on("onSupplierChange", (supplier) => {
            this.selectedSupplier = supplier;
        });
    },

    watch: {
        selectedSupplier() {
            this.retrievePayments();
        },
    },
};
</script>

<style>
.list {
  text-align: left;
  max-width: auto;
  margin: auto;
  padding-top: 13px;
}

.v-list {
  padding-right: 0px;
  padding-left: 0px;
}

.v-list-item {
  padding-right: 0px;
  padding-left: 0px;
}

.v-list-item__content {
  padding-top: 0px !important;
  padding-bottom: 0px !important;
}

.header {
  margin-top: 0px !important;
}

.row {
  justify-content: space-around !important;
}

.flex {
  padding-left: 0px;
  padding-right: 0px;
}

.right {
  text-align: right;
}

.list-styles{
    padding-left: 25px;
    padding-right: 25px;
    border-radius: 12px !important;
}
</style>

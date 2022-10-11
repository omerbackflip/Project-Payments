<template>
    <v-dialog
        v-model="dialog"
        width="500"
        :style="{ zIndex: options.zIndex }"
        @keydown.esc="cancel"
    >
        <v-card>
            <v-card-title class="text-h5 grey lighten-2">
                {{!update ? 'New' : 'Update'}} Project
            </v-card-title>
            <div class="field-margin" v-show="showMessage">
                {{message}}
            </div>
            <v-text-field class="field-margin" v-model="project.name" label="Name"></v-text-field>
            <v-text-field class="field-margin" v-model="project.budget" label="Budget"></v-text-field>
            <div class="budgets-wrapper">
                <v-container>
                    <div v-for="(textField, i) in supplierBudgets" :key="i" class="text-fields-row">
                        <v-row>
                            <v-col cols="4">
                                <v-select class="mt-5" :items="currentSuppliers" v-model="textField.supplier" label="Supplier" dense></v-select>
                            </v-col>
                            <v-col cols="4">
                                <v-text-field label="Budget" v-model="textField.budget" ></v-text-field>
                            </v-col>
                            <v-col cols="2">
                                <v-btn @click="removeBudgetField(i)" class="error"><v-icon small >mdi-delete</v-icon></v-btn>
                            </v-col>
                        </v-row>
                    </div>                    
                    <v-btn @click="addBudgetField" class="primary"><v-icon small >mdi-plus</v-icon></v-btn>					
                </v-container>

            </div>
            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="dialog = false"> Close </v-btn>
                <v-btn :disabled = "!project.name" color="primary" text @click="submitProject()"> Submit </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { PROJECT_MODEL, SUPPLIER_MODEL } from "../constants/constants";
import apiService from "../services/apiService";
import specificServiceEndPoints from '../services/specificServiceEndPoints';

export default {
    name: "project-form",
    data() {
        return {
            project: {
				budget: '',
				name: '',
			},
			supplierBudgets: [{ supplier: '', budget: 0 }],
            currentSuppliers: [],
			update: 0,
			dialog: false,
			showMessage: false,
			message: '',
            options: {
                color: "grey lighten-3",
                width: 500,
                zIndex: 200,
            },
        };
    },
    methods: {
        async submitProject() {
			try {
				let response;
				if(!this.update) {
					response = await apiService.create(this.project , {model:PROJECT_MODEL});
				} else {
					response = await apiService.update(this.update , this.project , {model:PROJECT_MODEL});
				}
				if(response.data) {
					this.message = 'Project successfully created/updated!';
                    if(this.supplierBudgets.length) {
                        await specificServiceEndPoints.addProjectBudgetsToSupplier(
                            response.data.data.id, 
                            this.supplierBudgets.filter(item => item.supplier !== null)
                        );
                    }
					this.showMessage = true;
					this.update = 0;
					setTimeout(() => {
						this.dialog = false;
						this.showMessage = false;
					}, 2000);
				}
			} catch (error) {
				console.log(error);
			}
		},
		async getAllProjectsAndSuppliers() {
            try {
                const suppliers = await apiService.get({model: SUPPLIER_MODEL});
                this.currentSuppliers = suppliers.data.map(supplier => supplier.name);
            } catch (error) {
                console.log(error);
            }
        },
		addBudgetField() {
			this.supplierBudgets.push({ supplier: "" , budget: "" });
		},
		removeBudgetField(index) {
			this.supplierBudgets.splice(index, 1)
		},
        open(project, update = 0) {
            this.update = update;
            this.project = project;
            this.dialog = true;
        },
    },
    mounted(){
        this.getAllProjectsAndSuppliers();
    }
};
</script>

<style scoped>
    .budgets-wrapper{
        border: 10px solid #85a7ff;
        margin: 20px;
        padding: 20px;
    }
</style>
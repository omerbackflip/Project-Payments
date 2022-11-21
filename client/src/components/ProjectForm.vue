<template>
    <v-dialog
        v-model="dialog"
        width="500"
        :style="{ zIndex: options.zIndex }"
        @keydown.esc="cancel"
    >
        <v-card>
            <v-card-title class="text-h5 grey lighten-2">
                {{!project ? 'New' : 'Update'}} Project
            </v-card-title>
            <div class="field-margin" v-show="showMessage">
                {{message}}
            </div>
            <v-text-field class="field-margin" v-model="project.name" label="Name"></v-text-field>
            <v-text-field class="field-margin" v-model="project.budget" label="Budget"></v-text-field>
            <div class="suppliers-wrapper">
                <h3>Suppliers</h3>
                <v-container>
                    <div v-for="(textField, i) in project.suppliers" :key="i" class="text-fields-row">
                        <v-row>
                            <v-col cols="4">
                                <v-select class="mt-5" :items="currentSuppliers" v-model="textField.name" label="Supplier" dense></v-select>
                            </v-col>
                            <v-col cols="4" sm="6">
                                <v-text-field label="Budget" v-model="textField.budget" ></v-text-field>
                            </v-col>
                            <v-col cols="2">
                                <v-btn @click="removeBudgetField(i)" class="error" x-small><v-icon small >mdi-delete</v-icon></v-btn>
                            </v-col>
                        </v-row>
                    </div>                    
                    <v-btn @click="addBudgetField" class="primary" small><v-icon small >mdi-plus</v-icon></v-btn>					
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
import { PROJECT_MODEL, TABLE_MODEL } from "../constants/constants";
// import { PROJECT_MODEL, SUPPLIER_MODEL } from "../constants/constants";
import apiService from "../services/apiService";
import specificServiceEndPoints from '../services/specificServiceEndPoints';

export default {
    name: "project-form",
    data() {
        return {
            currentSuppliers: [],
            allSuppliers: [], // looks that this is not used
            project: {name: '' , budget: '', suppliers: []},
			dialog: false,
            resolve: null,
			showMessage: false,
            newProject: false,
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
				if(this.newProject) {
					response = await apiService.create({name: this.project.name , budget: this.project.budget} , {model:PROJECT_MODEL});
				} else {
					response = await apiService.update(this.project._id , { name: this.project.name , budget: this.project.budget } , {model:PROJECT_MODEL});
				}

                if(response.data && response.data.data) {
					this.message = 'Project successfully created/updated!';
                    if(this.project.suppliers.length) {
                        await specificServiceEndPoints.addProjectBudgetsToSupplier(
                            response.data.data._id, 
                            this.project.suppliers.map(item => {
                                return {
                                    // supplier: this.allSuppliers[ this.allSuppliers.findIndex(supplier => item.name === supplier.name) ]._id,
                                    // payments: item.payments,
                                    name: item.name,
                                    budget: item.budget
                                };
                            })
                        );
                    }
				}
                this.showMessage = true;
                setTimeout(() => {
                    this.dialog = false;
                    this.showMessage = false;
                    this.resolve(true);
                }, 2000);

			} catch (error) {
				console.log(error);
			}
		},
		async getAllProjectsAndSuppliers() {
            try {
                // const suppliers = await apiService.get({model: SUPPLIER_MODEL});
                // this.currentSuppliers = suppliers.data.map(supplier => supplier.name);
                const suppliers = await apiService.get({model: TABLE_MODEL, table_id: 1});
                this.currentSuppliers = suppliers.data.map(supplier => supplier.description);
                this.allSuppliers = suppliers.data;
            } catch (error) {
                console.log(error);
            }
        },
		addBudgetField() {
			this.project.suppliers.push({ supplier: "" , budget: "" });
		},
		removeBudgetField(index) {
			this.project.suppliers.splice(index, 1);
		},
        open(project, newProject) {
            this.newProject = newProject;
            this.project = newProject 
                ? {name: '' , budget: 0 , suppliers: []} 
                : {...project,
                    suppliers: project.suppliers.map(item => {
                        return {
                            name: item.supplier,
                            budget: item.budget,
                        }})
                  };
            // console.log(this.project)
            this.dialog = true;
            return new Promise((resolve) => {
                this.resolve = resolve;
            });
        },
    },
    mounted(){
        this.getAllProjectsAndSuppliers();
    }
};
</script>

<style scoped>
    .suppliers-wrapper{
        border: 10px solid #85a7ff;
        margin: 20px;
        padding: 20px;
    }

</style>
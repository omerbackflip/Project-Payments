import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "paymentList",
      component: () => import("./components/PaymentsList")
    },
    {
      path: "/project-list",
      name: "project-list",
      component: () => import("./components/ProjectList")
    },
    {
      path: "/supplier-list",
      name: "supplier-list",
      component: () => import("./components/SupplierList")
    },
    {
      path: "/table-list",
      name: "tableList",
      component: () => import("./components/TableList")
    },
  ]
});
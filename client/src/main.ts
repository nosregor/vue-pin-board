import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import { Boards } from "./components";

const routes = [
  // {
  //   path: '*',
  //   redirect: '/',
  // },
  {
    path: "/",
    component: Boards,
  },
];

const router = createRouter({
  history: createWebHistory(""),
  routes,
});

const app = createApp(App);
app.use(router);

app.mount("#app");

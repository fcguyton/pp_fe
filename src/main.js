import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import authModule from './modules/auth';
import portfolioModule from './modules/portfolio';

import { registerModules } from "./register-modules";

registerModules({
    auth: authModule,
    portfolio: portfolioModule
  });

createApp(App).use(store).use(router).mount('#app')

import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import PageNotFound from '../views/404.vue'

const routes = [
  {
    path: '/',
    name: 'AppHome',
    component: Home
  },
  { 
    path: '/:pathMatch(.*)*',
    name: '404',
    component: PageNotFound 
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

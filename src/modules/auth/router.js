import Login from './Login.vue'

export default {
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/logout',
      name: 'Logout',
      // also works with dynamic imports for code splitting
      component: () => import('./Logout.vue')
    }
  ]
}

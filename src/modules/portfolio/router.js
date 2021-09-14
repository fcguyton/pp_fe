import Home from './Home.vue'
import PortfolioDetail from './PortfolioDetail'

export default {
  routes: [
    {
      path: '/home',
      name: 'Home',
      component: Home
    },
    {
      path: '/portfolio-detail/:port_id/:title',
      name: 'PortfolioDetail',
      component: PortfolioDetail
    }
  ],
  // router lifecycle hooks that can be used for navigation guards are supported as well
  beforeEach: (to, from, next) => {
    next()
  }
}

import Home from './Home.vue'
import PortfolioDetail from './PortfolioDetail'
import Analysis from './Analysis'

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
    },
    {
      path: '/analysis',
      name: 'Analysis',
      component: Analysis
    }
  ],
  // router lifecycle hooks that can be used for navigation guards are supported as well
  beforeEach: (to, from, next) => {
    next()
  }
}

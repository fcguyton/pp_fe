export default {
  namespaced: true,
  state: {
    analysisType: 'Wealth Index',
    wealthIndexGridData: null,
    targetPortfolio: null,
    showWealthIndexGraph: true
  },
  mutations: {
    updateAnalysisType: (state, payload) => state.analysisType = payload,
    updateTargetPortfolio: (state, payload) => state.targetPortfolio = payload,
    updateWealthIndexGridData: (state, payload) => state.wealthIndexGridData = payload,
    toggleWealthIndexGraph: (state) => state.showWealthIndexGraph = !state.showWealthIndexGraph,
  },
  getters: {
    getAnalysisType: (state) => state.analysisType,
    getTargetPortfolio: (state) => state.targetPortfolio,
    getWealthIndexGridData: (state) => state.wealthIndexGridData,
    getShowWealthIndexGraph: (state) => state.showWealthIndexGraph
  }
}

export default {
  namespaced: true,
  state: {
    analysisType: 'Wealth Index',
    wealthIndexGridData: null,
    targetPortfolio: null,
    showWealthIndexGraph: true,
    startDate: null,
    endDate: null
  },
  mutations: {
    updateAnalysisType: (state, payload) => state.analysisType = payload,
    updateTargetPortfolio: (state, payload) => state.targetPortfolio = payload,
    updateWealthIndexGridData: (state, payload) => state.wealthIndexGridData = payload,
    toggleWealthIndexGraph: (state) => state.showWealthIndexGraph = !state.showWealthIndexGraph,
    updateStartDate: (state,payload) => state.startDate = payload,
    updateEndDate: (state,payload) => state.endDate = payload
  },
  getters: {
    getAnalysisType: (state) => state.analysisType,
    getTargetPortfolio: (state) => state.targetPortfolio,
    getWealthIndexGridData: (state) => state.wealthIndexGridData,
    getShowWealthIndexGraph: (state) => state.showWealthIndexGraph,
    getStartDate: (state) => state.startDate,
    getEndDate: (state) => state.endDate
  }
}

<template>
  <header>
    <div class="header__content">
      <h1 class="heading">{{portfolioTitle}}</h1>
      <small>{{ analysisType }}</small>
    </div>
    <div class="links">
      <router-link to="/home">Home</router-link>
      <a href="#" @click="goBack">Portfolio</a>
      <router-link to="/logout">Logout</router-link>
    </div>
  </header>
  <!-- This is the main analysis page. Wealth Analysis and Future Analysis are the two components on this page -->
  <div class="analysis_content mb-5">
    <div class="wealth_analysis_container" v-if="analysisType === 'Wealth Index'">
      <WealthIndex />
    </div>

    <div class="wealth_analysis_container" v-if="analysisType === 'Portfolio Stats'">
      <PortfolioStats />
    </div>

    <div class="wealth_analysis_container" v-if="analysisType === 'CPPI'">
      <CPPI />
    </div>

    <div class="wealth_analysis_container" v-if="analysisType === 'Simulated Returns'">
      <SimulatedReturns />
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { useStore } from "vuex";

import WealthIndex from "./components/WealthIndex";
import CPPI from './components/CPPI';
import PortfolioStats from './components/PortfolioStats';
import SimulatedReturns from './components/SimulatedReturns.vue';

export default {
  name: "Analysis",
  components: { WealthIndex, CPPI, PortfolioStats, SimulatedReturns },
  setup() {
    const router = useRouter();
    const store = useStore();

    const analysisType = store.getters["portfolio/getAnalysisType"];
    const portfolioTitle = localStorage.getItem("portfolioTitle");
    const goBack = () => {
      router.go(-2);
    };
    

    return {
      analysisType,
      portfolioTitle,
      goBack,
    };
  },
};
</script>

<style scoped>
.analysis_content{
  width: 90%;
  margin: auto;
}
</style>
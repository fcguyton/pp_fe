<template>
	<h1>Simulated Returns</h1>
	<div class="controls" :class="{ disable: !dataAvailable }">
		<button @click="showChart = !showChart" class="btn btn-lg btn-success">
			{{ showChart ? "Data" : "Chart" }}
		</button>
		<div class="d-flex justify-content-center align-items-center">
			<input
				type="number"
				v-model="historyYear"
				@keypress="dateValidator"
				placeholder="# Years History"
			/>
			<input
				type="number"
				v-model="futureYear"
				@keypress="dateValidator"
				placeholder="# Years Future"
			/>
			<div class="form-check">
				<input type="checkbox" class="form-check-input" v-model="cppi" />
				<label class="form-check-label" for="exampleCheck1">CPPI</label>
			</div>
			<div class="filter">
				<i
					class="fa fa-2x fa-filter btn"
					:class="[
						historyYear || futureYear || cppi
							? 'text-success'
							: 'text-secondary disable-click',
					]"
					aria-hidden="true"
					@click="filterData"
				></i>
			</div>
			<i
				class="fa fa-2x fa-refresh text-primary"
				aria-hidden="true"
				@click="reloadData"
			></i>
		</div>
	</div>

	<div v-if="dataAvailable">
		<Chart
			v-if="showChart"
			:data="graphSeries"
			:date="graphDate"
			:key="graphDate"
		/>

		<Grid v-else :data="gridData" :keys="gridColumns" />
	</div>

	<Spinner v-else />
</template>

<script>
import { onMounted, ref } from "@vue/runtime-core";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

import Chart from "./Chart";
import Grid from "./Grid";
import Spinner from "./Spinner";

import axios from "axios";

import formatParams from "@/composables/formatParams";
import gridDateFormat from "@/composables/gridDateFormat";
import prepareGraphData from "@/composables/prepareGraphData";

export default {
	name: "SimulatedReturns",
	components: { Chart, Grid, Spinner },
	setup() {
		onMounted(async () => {
			await fetchAnalysisData();
		});

		const router = useRouter();
		const store = useStore();
		const gridData = ref([]);
		const gridColumns = ref([]);
		const graphSeries = ref([]);
		const graphDate = ref([]);
		const showChart = ref(false);
		const dataAvailable = ref(false);
		const analysisType = store.getters["portfolio/getAnalysisType"];
		const historyYear = ref('');
		const futureYear = ref('');
		const cppi = ref(false);

		// THESE VARIABLES ARE GLOBAL AS THEY WILL BE USED IN REQUESTS
		var token = localStorage.getItem("token");
		var headers = { "x-access-token": token };
		var base_url = store.state.base_url;
        var id = localStorage.getItem("port_id");
        const componentUrl  = '/analysis/simreturns/';

        const requestData = async (url) => {
            dataAvailable.value = false;
            axios
				.get(url, { headers: headers })
				.then(function(response) {
					let data = JSON.parse(response.data);

					// // separate the column names from the incoming data
					gridColumns.value = Object.keys(data[0]);

					// prepare data for using it in grid
					gridData.value = gridDateFormat(data);

					dataIsAvailable();
					let graphData = prepareGraphData(JSON.parse(response.data));
					graphDate.value = graphData.graph_date;
					graphSeries.value = graphData.graph_series;
				})
				.catch(function(error) {
					console.log("error in getting simulated returns: ", error.response);
					let errorCode = error.response.status;
					if (errorCode === 401) {
						router.push({
							name: "Logout",
						});
					}
				});
        }

		const fetchAnalysisData = async () => {
			let url = base_url + componentUrl + id;

			requestData(url)
		};

		// const prepareGraphData = (data) => {
		// 	let myData = {};
		// 	for (let i = 0; i < keys.value.length; i++) {
		// 		myData[keys.value[i]] = data.map((a) => a[keys.value[i]]);
		// 	}

		// 	let plottingData = [];

		// 	for (let i = 0; i < keys.value.length; i++) {
		// 		let curve = { name: keys.value[i], data: myData[keys.value[i]] };
		// 		plottingData.push(curve);
		// 	}

		// 	// separate the x-axis and y-axis (series) for plot
		// 	let date = plottingData.filter((item) => item.name === "Date");
		// 	graphDate.value = date[0].data;
		// 	graphSeries.value = plottingData.filter((item) => item.name !== "Date");
		// };

		const dataIsAvailable = () => (dataAvailable.value = true);

		const reloadData = () => {
			historyYear.value = '';
			futureYear.value = '';
			cppi.value = false;
			fetchAnalysisData();
		};

		const dateValidator = (e) => {
			if (!e.key.match(/^[0-9+]*$/)) {
				e.preventDefault();
			}
		};

		const filterData = () => {
			let historical_years = historyYear.value;
			let future_years = futureYear.value;
			let cppi_value = cppi.value;

			let params = {
				historical_years: encodeURIComponent(historical_years),
				future_years: encodeURIComponent(future_years),
				use_cppi: encodeURIComponent(cppi_value),
			};

			let url =
				base_url + componentUrl + id + "?" + formatParams(params);

            requestData(url)
		};

		return {
			gridData,
			gridColumns,
			analysisType,
			graphSeries,
			graphDate,
			showChart,
			dataAvailable,
			reloadData,
			dateValidator,
			futureYear,
			historyYear,
			filterData,
			cppi,
		};
	},
};
</script>

<style scoped>
.controls {
	background: rgba(255, 219, 106, 0.35);
	color: #2c3e50;
	padding: 40px;
	margin: 20px 0;
	border-radius: 14px;
	box-shadow: 2px 2px 5px 1px rgba(0, 0, 0, 0.2);

	display: flex;
	justify-content: space-between;
}

input[type="number"] {
	margin-right: 20px;
	height: 40px;
	padding: 0 10px;
	width: 150px;
}

.disable {
	display: none;
	pointer-events: none;
	background: grey !important;
}

.disable:hover {
	cursor: not-allowed;
}

.disable button {
	text-decoration: line-through;
	font-style: italic;
}

.disable-click {
	pointer-events: none;
}
</style>

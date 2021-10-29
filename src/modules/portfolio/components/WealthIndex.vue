<template>
	<div class="controls" :class="{ disable: !dataAvailable }">
		<button @click="toggleChart" class="btn btn-lg btn-success">
			{{ showChart ? "Data" : "Chart" }}
		</button>
		<div class="d-flex justify-content-center align-items-center">
			<input
				type="number"
				:min="minDate"
				maxlength="4"
				ref="startInput"
				v-model="startDate"
				@keypress="dateValidator"
				placeholder="Start year"
			/>
			<input
				type="number"
				:max="maxDate"
				maxlength="4"
				ref="endInput"
				v-model="endDate"
				@keypress="dateValidator"
				placeholder="End year"
			/>
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

		<Grid v-else :data="analysisData" :keys="keys" />
	</div>

	<Spinner v-else />
</template>

<script>
import { onMounted, ref, watch } from "@vue/runtime-core";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

import Chart from "./Chart";
import Grid from "./Grid";
import Spinner from "./Spinner";

import axios from "axios";
import dayjs from "dayjs";

export default {
	name: "WealthIndex",
	components: { Chart, Grid, Spinner },
	setup() {
		onMounted(async () => {
			await fetchAnalysisData();
		});

		const router = useRouter();
		const store = useStore();
		const analysisData = ref([]);
		const keys = ref([]);
		const graphSeries = ref([]);
		const graphDate = ref([]);
		const showChart = ref(store.getters["portfolio/getShowWealthIndexGraph"]);
		const dataAvailable = ref(false);
		const analysisType = store.getters["portfolio/getAnalysisType"];
		const minDate = ref(null);
		const maxDate = ref(null);
		const startDate = ref(null);
		const endDate = ref(null);
		const startInput = ref(null);
		const endInput = ref(null);

		// THESE VARIABLES ARE GLOBAL AS THEY WILL BE USED IN REQUESTS
		var token = localStorage.getItem("token");
		var headers = { "x-access-token": token };
		var base_url = store.state.base_url;
		var id = localStorage.getItem("port_id");
		const componentUrl = "/analysis/wealthindex/";

		const requestData = async (url) => {
			axios
				.get(url, { headers: headers })
				.then(function(response) {
					let data = JSON.parse(response.data);

					// save the fetch data as it would be used when user is filtering data
					store.commit(
						"portfolio/updateWealthIndexGridData",
						JSON.parse(response.data)
					);

					// save min and max Dates. These will be extreme date values a user can enter in the inputs
					minDate.value = parseInt(dayjs(data[0].Date).format("YYYY"));
					maxDate.value = parseInt(
						dayjs(data[data.length - 1].Date).format("YYYY")
					);

					// set the min and max Dates in the store so that other analysis components can use them for reference
					store.commit("portfolio/updateStartDate", minDate.value);
					store.commit("portfolio/updateEndDate", maxDate.value);

					// updating the inputs max and min so that the start input field never gets larger than end input field and vice-versa
					startInput.value.setAttribute("max", maxDate.value);
					endInput.value.setAttribute("min", minDate.value);

					// separate the column names from the incoming data
					keys.value = Object.keys(data[0]);

					// prepare data for using it in grid
					analysisData.value = prepareData(data);

					dataIsAvailable();
					prepareGraphData(JSON.parse(response.data));
				})
				.catch(function(error) {
					console.log("error in getting wealth index info: ", error.response);
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

		const prepareData = (data) => {
			// format the date column in incoming data
			for (let i = 0; i < data.length; i++) {
				data[i].Date = dayjs(data[i].Date).format("MM/DD/YY");
			}
			return data;
		};

		const prepareGraphData = (data) => {
			let myData = {};
			for (let i = 0; i < keys.value.length; i++) {
				myData[keys.value[i]] = data.map((a) => a[keys.value[i]]);
			}

			let plottingData = [];

			for (let i = 0; i < keys.value.length; i++) {
				let curve = { name: keys.value[i], data: myData[keys.value[i]] };
				plottingData.push(curve);
			}

			// separate the x-axis and y-axis (series) for plot
			let date = plottingData.filter((item) => item.name === "Date");
			graphDate.value = date[0].data;
			graphSeries.value = plottingData.filter((item) => item.name !== "Date");
		};

		const dataIsAvailable = () => (dataAvailable.value = true);

		const toggleChart = () => {
			store.commit("portfolio/toggleWealthIndexGraph");
			showChart.value = store.getters["portfolio/getShowWealthIndexGraph"];
		};

		const reloadData = () => {
			startDate.value = null;
			endDate.value = null;
			dataAvailable.value = false;
			fetchAnalysisData();
		};

		const dateValidator = (e) => {
			if (!e.key.match(/^[0-9+]*$/)) {
				e.preventDefault();
			}
		};

		const filterData = (isStarting) => {
			let start = startDate.value === null ? minDate.value : startDate.value;
			let end = endDate.value === null ? maxDate.value : endDate.value;
			let storedData = JSON.parse(
				JSON.stringify(store.getters["portfolio/getWealthIndexGridData"])
			);

			let filteredData = storedData.filter((item) => {
				let currentItem = { ...item };
				return (
					parseInt(dayjs(currentItem.Date).format("YYYY")) >= start &&
					parseInt(dayjs(currentItem.Date).format("YYYY")) <= end
				);
			});

			if (isStarting) {
				endInput.value.setAttribute("min", startDate.value);
			} else {
				startInput.value.setAttribute("max", endDate.value);
			}

			// prepare data for grid
			analysisData.value = prepareData(filteredData);

			// prepare data for graph
			// convert the date back to unix miliseconds so that it can be used in graph
			let formatForGraph = filteredData.map((item) => {
				return { ...item, Date: dayjs(item.Date).unix() * 1000 };
			});
			prepareGraphData(formatForGraph);
		};

		watch(startDate, () => {
			filterData(true);
		});

		watch(endDate, () => {
			filterData(false);
		});

		return {
			analysisData,
			keys,
			analysisType,
			graphSeries,
			graphDate,
			minDate,
			maxDate,
			startDate,
			endDate,
			startInput,
			endInput,
			showChart,
			toggleChart,
			dataAvailable,
			reloadData,
			dateValidator,
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

input {
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
</style>

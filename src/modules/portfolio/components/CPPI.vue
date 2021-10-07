<template>
	<h1>CPPI Analysis</h1>
	<div v-if="dataAvailable" class="controls">
		<div class="inputs">
			<input
				type="number"
				placeholder="Start Year"
				step="1"
				:min="startDate"
				:max="endDate"
				v-model="startInput"
			/>
			<input
				type="number"
				placeholder="End Year"
				step="1"
				:min="startDate"
				:max="endDate"
				v-model="endInput"
			/>
		</div>
		<div class="filter">
			<i
				class="fa fa-2x fa-filter btn"
				:class="[
					startInput || endInput ? 'text-success' : 'text-secondary disable',
				]"
				aria-hidden="true"
				@click="filterData"
			></i>
		</div>
	</div>

	<!-- create a table and display the data in the form of grid -->
	<div v-if="dataAvailable" class="table_container">
		<table class="table table-striped table-light">
			<thead>
				<tr>
					<th>Symbol</th>
					<th>Shares</th>
					<th>Value</th>
					<th>Allocation</th>
					<th>CPPI Shares</th>
					<th>CPPI Value</th>
					<th>CPPI Allocation</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="data in analysisData" :key="data.Symbol">
					<td>
						{{ data.symbol }}
					</td>
					<td>
						{{ data.current_shares }}
					</td>
					<td>
						{{ data.current_value }}
					</td>
					<td>
						{{ data.current_alloc }}
					</td>
					<td>
						{{ data.cppi_shares }}
					</td>
					<td>
						{{ data.cppi_value }}
					</td>
					<td>
						{{ data.cppi_alloc }}
					</td>
				</tr>
			</tbody>
		</table>
	</div>

	<Spinner v-else />
</template>

<script>
import { onMounted, ref } from "@vue/runtime-core";
import { useStore } from "vuex";

import formatParams from "@/composables/formatParams";
import Spinner from "./Spinner";

import axios from "axios";

export default {
	components: { Spinner },
	setup() {
		onMounted(async () => {
			await fetchData();
		});

		const store = useStore();
		const startDate = store.getters["portfolio/getStartDate"];
		const endDate = store.getters["portfolio/getEndDate"];
		const analysisData = ref([]);
		const dataAvailable = ref(false);
		const startInput = ref(null);
		const endInput = ref(null);

		// THESE VARIABLES ARE GLOBAL AS THEY WILL BE USED IN REQUESTS
		var token = localStorage.getItem("token");
		var headers = { "x-access-token": token };
		var base_url = store.state.base_url;

		const fetchData = async () => {
			dataAvailable.value = false;

			let endPoint = prepareUrl();

			apiCall(endPoint);
		};

		// this function will check if we have to send start_year and end_year
		const prepareUrl = () => {
			let id = localStorage.getItem("port_id");
			let url = base_url + "/analysis/portcppi/" + id;
			let params = {};

			// check if we know startDate and endDate of our data from previous api call (i.e WealthIndex)
			if (startDate && endDate && !startInput.value && !endInput.value) {
				params = {
					start_year: encodeURIComponent(startDate),
					end_year: encodeURIComponent(endDate),
				};
			} else if (startInput.value && endInput.value) {
				params = {
					start_year: encodeURIComponent(startInput.value),
					end_year: encodeURIComponent(endInput.value),
				};
			} else if (startInput.value) {
				params = {
					start_year: encodeURIComponent(startInput.value),
				};
			} else if (endInput.value) {
				params = {
					end_year: encodeURIComponent(endInput.value),
				};
			} else {
				return url;
			}

			return url + "?" + formatParams(params);
		};

		const apiCall = async (url) => {
			axios
				.get(url, { headers: headers })
				.then(function(response) {
					let data = JSON.parse(response.data);
					console.log(data);
					analysisData.value = data;
					dataAvailable.value = true;
				})
				.catch(function(error) {
					console.log("error in details: ", error.response);
					let errorCode = error.response.status;
					if (errorCode === 401) {
						router.push({
							name: "Logout",
						});
					}
				});
		};

		const filterData = () => {
			fetchData();
		};

		return {
			startDate,
			endDate,
			analysisData,
			dataAvailable,
			startInput,
			endInput,
			filterData,
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

.portfolio__item {
	display: flex;
	justify-content: space-between;
	margin: 40px auto;
	background: whitesmoke;
	padding: 10px 20px;
	border-radius: 14px;
	box-shadow: 2px 2px 5px 1px rgba(0, 0, 0, 0.2);
	text-align: left;
	text-decoration: none;
	color: #2c3e50;
}

.portfolio__item:hover {
	background: #d0f0c0;
	cursor: pointer;
	color: #2c3e50;
	text-decoration: none;
}

.portfolio__stats {
	text-align: right;
}

.disable {
	pointer-events: none;
}

.disable:hover {
	cursor: not-allowed;
}
</style>

<template>
  <header>
    <div class="header__content">
      <h1 class="heading">{{ title }}</h1>
    </div>
    <div class="links">
      <router-link to="/home">Home</router-link>
      <DropdownList
        title="Analysis"
        :options="['Wealth Index', 'Portfolio Stats', 'CPPI', 'Simulated Returns']"
        @optionSelected="optionSelected"
      />
      <a href="#" @click="itemModal = true">New</a>
      <router-link to="/logout">Logout</router-link>
    </div>
  </header>

  <!-- New Asset -->
  <div v-if="itemModal" class="portfolio__item new__item">
    <div class="info">
      <h3>
        <input class="in1"
          type="text"
          placeholder="Enter Asset Name"
          v-model.trim="newAsset.symbol"
        />
      </h3>
      <p class="mt-3">
        <input class="in1"
          type="text"
          placeholder="Enter a description for asset"
          v-model.trim="newAsset.description"
        />
      </p>
    </div>
    <div class="info2">
      <input class="in2"
        type="text" 
        placeholder="# Shares"
        v-model.number="newAsset.amount"
        @keypress="numberValidator"
      />
      <input class="in2"
        type="text" 
        placeholder="Risk rating"
        v-model.number="newAsset.risk_rating"
        @keypress="numberValidator"
      />
    </div>

    <!-- icons -->
    <div class="options">
      <i
        class="fa fa-2x fa-times text-danger mr-2"
        aria-hidden="true"
        @click="itemModal = false"
      ></i>
      <i
        class="fa fa-2x fa-check ml-2 text-success"
        aria-hidden="true"
        @click="addAsset"
        :class="{
          disabled:
            !newAsset.symbol || !newAsset.description,
        }"
      ></i>
    </div>
  </div>

  <!-- List of Assets -->
  <div v-for="asset in assets" :key="asset.id">
    <!-- Normal assets when edit button is not clicked -->
    <div v-if="asset.id !== targetAsset.id" class="portfolio__item">

      <div class="info">
        <h4>{{ asset.symbol }}</h4>
        <p class="mt-3">{{ asset.description }}</p>
      </div>
      <div class="container">
        <div class="box">{{ asset.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }}</div><br>
        <div class="box">{{ asset.risk_rating }}</div>
      </div>
      <div class="options">
        <i
          class="fa fa-2x fa-trash text-danger mr-2"
          aria-hidden="true"
          @click="deleteAsset(asset)"
        ></i>
        <i
          class="fa fa-2x fa-pencil ml-2"
          aria-hidden="true"
          @click="editAsset(asset)"
        ></i>
      </div>
    </div>

    <!-- Asset in edit mode -->
    <div v-else class="portfolio__item">
      <div class="info">
        <h3>
          <input
            type="text"
            placeholder="Enter Asset Name"
            v-model="targetAsset.symbol"
            readonly
          />
        </h3>
        <p class="mt-3">
          <input
            type="text"
            placeholder="Enter a description for asset"
            v-model.trim="targetAsset.description"
          />
        </p>
      </div>
      <div class="info2">
        <input class="in2" 
          type="text"
          placeholder="# shares"
          v-model.number="targetAsset.amount"
          @keypress="numberValidator"
        />
        <input class="in2" 
          type="text"
          placeholder="Risk rating"
          v-model.number="targetAsset.risk_rating"
          @keypress="numberValidator"
        />
      </div>
      <div class="options">
        <i
          class="fa fa-2x fa-times text-danger mr-2"
          aria-hidden="true"
          @click="targetAsset = {}"
        ></i>
        <i
          class="fa fa-2x fa-check ml-2 text-success"
          aria-hidden="true"
          @click="updateAsset"
          :class="{ disabled: !targetAsset.description }"
        ></i>
      </div>
    </div>
  </div>

  <div class="alert alert-danger w-50 m-auto" role="alert" v-if="noData">
    No assets for this portfolio
  </div>

  <!-- Modal -->
  <Modal
    v-if="showModal"
    :data="targetAsset"
    @toggleModal="showModal = !showModal"
    @confirmDelete="confirmDelete"
  />

  <!-- Spinner -->
  <Spinner v-if="showSpinner" />
</template>

<script>
import { ref } from "@vue/reactivity";
import { useRoute, useRouter } from "vue-router";
import { onMounted } from "@vue/runtime-core";
import axios from "axios";
import Modal from "./Modal.vue";
import Spinner from "@/components/Spinner";
import DropdownList from "@/components/DropdownList";
import formatParams from "@/composables/formatParams";
import { useStore } from "vuex";

export default {
  name: "navbar",
  components: { Modal, Spinner, DropdownList },
  setup() {
    onMounted(async () => {
      await fetchPortfolioAssets();
    });

    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const title = route.params.title;
    const assets = ref([]);
    const itemModal = ref(false);
    const newAsset = ref({ symbol: "", description: "", amount: "", risk_rating: "" });
    const targetAsset = ref({});
    const showModal = ref(false);
    const showSpinner = ref(true);
    const noData = ref(false);
    var base_url = store.state.base_url;

    // THESE VARIABLES ARE GLOBAL AS THEY WILL BE USED IN REQUESTS
    var token = localStorage.getItem("token");
    var headers = { "x-access-token": token };

    const addAsset = () => {
      if (
        newAsset.value.symbol &&
        newAsset.value.description
      ) {
        let id = route.params.port_id;

        // check if shares and risk_rating are empty, replace nothing with ' '
        let amount = newAsset.value.amount === '' ? ' ' : newAsset.value.amount
        let risk_rating = newAsset.value.risk_rating === '' ? ' ' : newAsset.value.risk_rating

        let params = {
          symbol: encodeURIComponent(newAsset.value.symbol),
          description: encodeURIComponent(newAsset.value.description),
          amount: encodeURIComponent(amount),
          risk_rating: encodeURIComponent(risk_rating),
        };

        console.log(params)

        let url =
          base_url + "/port-assetcreate/" + id + "?" + formatParams(params);

        axios
          .post(url, {}, { headers: headers })
          .then(function (response) {
            assets.value = JSON.parse(response.data);
            showSpinner.value = false;
            fetchPortfolioAssets();
          })
          .catch(function (error) {
            console.log("error while adding asset", error.response);
            let errorCode = error.response.status;
            if (errorCode === 401) {
              router.push({
                name: "Logout",
              });
            }
            if (errorCode === 409) {
              alert("Asset already exists");
            }
          });

        newAsset.value = {symbol: "", description: "", amount: "", risk_rating: ""};
        itemModal.value = false;
      } else {
        alert("Missing fields");
      }
    };

    const deleteAsset = (asset) => {
      targetAsset.value = asset;
      showModal.value = true;
    };

    const editAsset = (asset) => {
      let amount = asset.amount === ' ' ? '' : asset.amount
      let risk_rating = asset.risk_rating === ' ' ? '' : asset.risk_rating
      targetAsset.value = { ...asset, amount, risk_rating };
    };

    const updateAsset = () => {
      if (
        targetAsset.value.symbol &&
        targetAsset.value.description
        // targetAsset.value.risk_rating
      ) {
        showSpinner.value = true;

        let id = route.params.port_id;
        // send request to backend

        // convert the blank values to ' ' to avoid errors
        let amount = targetAsset.value.amount === '' ? ' ' : targetAsset.value.amount
        let risk_rating = targetAsset.value.risk_rating === '' ? ' ' : targetAsset.value.risk_rating 

        let params = {
          symbol: targetAsset.value.symbol,
          description: encodeURIComponent(targetAsset.value.description),
          amount: encodeURIComponent(amount),
          risk_rating: encodeURIComponent(risk_rating),
        };

        let url =
          base_url + "/port-assetupdate/" + id + "?" + formatParams(params);

        axios
          .post(url, {}, { headers: headers })
          .then(function (response) {
            fetchPortfolioAssets();
          })
          .catch(function (error) {
            console.log("error while updating asset", error.response);
            let errorCode = error.response.status;
            if (errorCode === 401) {
              router.push({
                name: "Logout",
              });
            }
          });

        targetAsset.value = {};
      } else {
        alert("missing fileds");
      }
    };

    const confirmDelete = () => {
      showModal.value = false;
      let params = { symbol: targetAsset.value.symbol };
      let id = route.params.port_id;

      let url =
        base_url + "/port-assetdelete/" + id + "?" + formatParams(params);

      showModal.value = false;
      showSpinner.value = true;

      axios
        .delete(url, { headers: headers })
        .then(function (response) {
          showSpinner.value = false;
          fetchPortfolioAssets();
        })
        .catch(function (error) {
          console.log("error while deleting asset ", error.response);
          let errorCode = error.response.status;
          if (errorCode === 401) {
            router.push({
              name: "Logout",
            });
          }
        });

      targetAsset.value = [];
    };

    const fetchPortfolioAssets = () => {
      showSpinner.value = true;
      const id = route.params.port_id;

      let url = base_url + "/port-assets/" + id;

      axios
        .get(url, { headers: headers })
        .then(function (response) {
          assets.value = prepareData(response.data);
          showSpinner.value = false;

          noData.value = assets.value.length === 0 ? true : false;
        })
        .catch(function (error) {
          console.log("error in details: ", error.response);
          let errorCode = error.response.status;
          if (errorCode === 401) {
            router.push({
              name: "Logout",
            });
          }
        });
    };

    const prepareData = (d) => {
      let data = JSON.parse(d);
      let formatedData = [];
      for (let i = 0; i < data.length; i++) {
        formatedData.push({ ...data[i], id: i });
      }

      // Order the array of objects based on names
      formatedData.sort((a, b) =>
        a.symbol.toUpperCase() > b.symbol.toUpperCase()
          ? 1
          : b.symbol.toUpperCase() > a.symbol.toUpperCase()
          ? -1
          : 0
      );

      return formatedData;
    };

    const assetTitleValidator = (e) => {
      if (!e.key.match(/^[a-zA-Z0-9_ ]*$/)) {
        e.preventDefault();
      }
    };

    const optionSelected = (option) => {
      store.commit("portfolio/updateAnalysisType", option);
      router.push({ name: "Analysis" });
    };

    const numberValidator = (e) => {
      if (!e.key.match(/^[0-9+.]*$/)) {
        e.preventDefault();
      }
    };

    return {
      assets,
      title,
      itemModal,
      newAsset,
      targetAsset,
      addAsset,
      deleteAsset,
      editAsset,
      updateAsset,
      showModal,
      confirmDelete,
      showSpinner,
      noData,
      assetTitleValidator,
      optionSelected,
      numberValidator
    };
  },
};
</script>

<style scoped>
.portfolio__item {
  display: flex;
  justify-content: space-between;
  width: 50%;
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
/* input {
  width: 100%;
} */

input:read-only {
  background-color: whitesmoke;
  border: none;
  font-style: italic;
}

input:read-only:focus {
  outline: none;
  border: none;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}

input[type="number"] {
  -moz-appearance: textfield; /* Firefox */
}

.share {
  font-size: 18px;
  font-weight: bold;
  padding: 5px;
  background: rgba(255, 0, 0, 0.5);
  color: white;
  letter-spacing: 0.5px;
  border-radius: 7px;
  text-align: center;
}

.new__item {
  background: rgba(255, 219, 106, 0.35);
}

.options {
  text-align: center;
}

.disabled {
  pointer-events: none;
  color: grey !important;
}

.info {
  width: 60%;
}

.info2 {
  width: 20%;
}

.in1 {
  width: 100%;
  padding: 0 10px;
}

.in2 {
  width: 75%;
  padding: 0 10px;
  text-align: right;
}

.container {
  width: 20%;
  /* border: 1px solid black; */
}

div.box {
  box-sizing: border-box;
  width: 100%;
  height: 30px;
  border: 1px solid black;
  /* float: left;
  padding: 6px 5px; */
  padding: 0 5px;
  text-align: right;
}
</style>
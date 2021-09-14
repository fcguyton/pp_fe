<template>
  <header>
    <div class="header__content">
      <h1 class="heading">{{ title }}</h1>
    </div>
    <div class="links">
      <router-link to="/home">Home</router-link>
      <a href="#" @click="itemModal = true">New</a>
      <router-link to="/logout">Logout</router-link>
    </div>
  </header>
  <hr />
  <!-- New Asset -->
  <div v-if="itemModal" class="portfolio__item new__item">
    <div class="info">
      <h3>
        <input
          type="text"
          placeholder="Enter Asset Name"
          v-model="newAsset.symbol"
          @keydown="assetTitleValidator($event)"
        />
      </h3>
      <p class="mt-3">
        <input
          type="text"
          placeholder="Enter a description for asset"
          v-model="newAsset.description"
        />
      </p>
    </div>
    <div class="options">
      <p>
        <input
          type="text"
          placeholder="# Shares"
          v-model.number="newAsset.amount"
        />
      </p>
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
            !newAsset.symbol || !newAsset.description || !newAsset.amount,
        }"
      ></i>
    </div>
  </div>

  <!-- List of Assets -->
  <div v-for="asset in assets" :key="asset.id">
    <!-- Normal assets when edit button is not clicked -->
    <div v-if="asset.id !== targetAsset.id" class="portfolio__item">
      <div class="info">
        <h3>{{ asset.symbol }}</h3>
        <p class="mt-3">{{ asset.description }}</p>
      </div>
      <div class="options">
        <p class="share">
          {{ asset.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }}
        </p>
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
            v-model="targetAsset.description"
          />
        </p>
      </div>
      <div class="options">
        <p>
          <input
            type="number"
            placeholder="# Shares"
            v-model.number="targetAsset.amount"
          />
        </p>
        <i
          class="fa fa-2x fa-times text-danger mr-2"
          aria-hidden="true"
          @click="targetAsset = {}"
        ></i>
        <i
          class="fa fa-2x fa-check ml-2 text-success"
          aria-hidden="true"
          @click="updateAsset"
          :class="{ disabled: !targetAsset.description || !targetAsset.amount }"
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
import formatParams from "@/composables/formatParams";
import { useStore } from "vuex";

export default {
  components: { Modal, Spinner },
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
    const newAsset = ref({ symbol: "", description: "", amount: "" });
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
        newAsset.value.description &&
        newAsset.value.amount
      ) {
        let id = route.params.port_id;

        let params = {
          symbol: newAsset.value.symbol,
          description: newAsset.value.description,
          amount: newAsset.value.amount,
        };

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
          });

        newAsset.value = [];
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
      targetAsset.value = { ...asset };
    };

    const updateAsset = () => {
      if (
        targetAsset.value.symbol &&
        targetAsset.value.description &&
        targetAsset.value.amount
      ) {
        showSpinner.value = true;

        let id = route.params.port_id;
        // send request to backend
        let params = {
          symbol: targetAsset.value.symbol,
          description: targetAsset.value.description,
          amount: targetAsset.value.amount,
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
  padding: 40px 60px;
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
input {
  width: 100%;
}

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
</style>
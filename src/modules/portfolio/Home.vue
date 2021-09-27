<template>
  <header>
    <div class="header__content">
      <h1 class="heading">Portfolio Planner</h1>
    </div>
    <div class="links">
      <a href="#" @click="itemModal = true">New</a>
      <router-link to="/logout">Logout</router-link>
    </div>
  </header>

  <div>

    <!-- New Portfolio -->
    <div v-if="itemModal" class="portfolio__item new__item">
      <div class="info">
        <h3>
          <input
            type="text"
            placeholder="Enter portfolio name"
            v-model.trim="newPortfolio.title"
          />
        </h3>
        <p class="mt-3">
          <input
            type="text"
            placeholder="Enter a description of the portfolio"
            v-model.trim="newPortfolio.description"
          />
        </p>
      </div>
      <div class="options">
        <i
          class="fa fa-2x fa-times text-danger mr-2"
          aria-hidden="true"
          @click="itemModal = false"
        ></i>
        <i
          class="fa fa-2x fa-check ml-2 text-success"
          aria-hidden="true"
          :class="{
            disabled: !newPortfolio.title || !newPortfolio.description,
          }"
          @click="addPortfolio"
        ></i>
      </div>
    </div>

    <!-- List of portfolios -->
    <div v-for="portfolio in portfolioList" :key="portfolio.port_id">

      <!-- Normal Portfolios -->
      <div
        v-if="portfolio.port_id != targetPortfolio.port_id"
        class="portfolio__item"
        @click.self="redirectPortfolioDetail(portfolio)"
      >
        <div class="info">
          <h4 @click.self="redirectPortfolioDetail(portfolio)">
            {{ portfolio.title }}
          </h4>
          <p class="mt-3" @click.self="redirectPortfolioDetail(portfolio)">
            {{ portfolio.description }}
          </p>
        </div>
        <div class="options">
          <p>{{ portfolio.port_id }}</p>
          <i
            class="fa fa-2x fa-trash text-danger mr-2"
            aria-hidden="true"
            @click="deletePortfolio(portfolio)"
          ></i>
          <i
            class="fa fa-2x fa-pencil ml-2"
            aria-hidden="true"
            @click="edit(portfolio)"
          ></i>
        </div>
      </div>

      <!-- When edit button is pressed, show this -->
      <div v-else class="portfolio__item">
        <div class="info">
          <h3>
            <input
              type="text"
              :class="{ 'is-invalid': !targetPortfolio.title }"
              placeholder="Enter Portfolio Name"
              v-model.trim="targetPortfolio.title"
            />
          </h3>
          <p class="mt-3">
            <input
              type="text"
              :class="{ 'is-invalid': !targetPortfolio.description }"
              placeholder="Enter a description for portfolio"
              v-model.trim="targetPortfolio.description"
            />
          </p>
        </div>
        <div class="options">
          <i
            class="fa fa-2x fa-times text-danger mr-2"
            aria-hidden="true"
            @click="targetPortfolio = {}"
          ></i>
          <i
            class="fa fa-2x fa-check ml-2 text-success"
            aria-hidden="true"
            :class="{
              disabled: !targetPortfolio.title || !targetPortfolio.description,
            }"
            @click="updatePortfolio"
          ></i>
        </div>
      </div>
    </div>

    <Modal
      v-if="showModal"
      :data="targetPortfolio"
      @toggleModal="showModal = !showModal"
      @confirmDelete="confirmDelete"
    />

  </div>

  <Spinner v-if="showSpinner" />

</template>

<script>
import { ref } from "@vue/reactivity";
import { onMounted } from "@vue/runtime-core";
import { useStore } from "vuex";
import axios from "axios";
import Modal from "./Modal.vue";
import { useRouter } from "vue-router";
import Spinner from "@/components/Spinner";
import formatParams from "@/composables/formatParams";

export default {
  components: { Modal, Spinner },
  setup() {
    onMounted(async () => {
      await fetchPortfolios();
    });

    const portfolioList = ref([]);
    const targetPortfolio = ref([]);
    const showModal = ref(false);
    const router = useRouter();
    const itemModal = ref(false);
    const newPortfolio = ref({});
    const userId = localStorage.getItem("user_id");
    const showSpinner = ref(true);
    const store = useStore();

    // THESE VARIABLES ARE GLOBAL AS THEY WILL BE USED IN REQUESTS
    var token = localStorage.getItem("token");
    var headers = { "x-access-token": token };
    var base_url = store.state.base_url;

    const fetchPortfolios = () => {
      showSpinner.value = true;

      let url = base_url;

      axios
        .get(url, { headers: headers })
        .then(function (response) {
          portfolioList.value = prepareData(response.data);
          showSpinner.value = false;
        })
        .catch(function (error) {
          console.log("error occured while fetching", error.response);
          let errorCode = error.response.status;
          if (errorCode === 401) {
            router.push({
              name: "Logout",
            });
          }
        });
    };

    const deletePortfolio = (portfolio) => {
      targetPortfolio.value = portfolio;
      showModal.value = true;
    };

    const edit = (portfolio) => {
      targetPortfolio.value = { ...portfolio };
    };

    const confirmDelete = () => {
      let url = base_url + "/portdelete/" + targetPortfolio.value.port_id;

      showModal.value = false;
      showSpinner.value = true;

      axios
        .delete(url, { headers: headers })
        .then(function (response) {
          showSpinner.value = false;
          fetchPortfolios();
        })
        .catch(function (error) {
          console.log("error occured while deleting", error.response);
          let errorCode = error.response.status;
          if (errorCode === 401) {
            router.push({ name: "Logout" });
          }
        });
      targetPortfolio.value = [];
    };

    const redirectPortfolioDetail = (portfolio) => {
      store.commit('portfolio/updateTargetPortfolio', portfolio)
      localStorage.setItem('portfolioTitle', portfolio.title)
      localStorage.setItem('port_id', portfolio.port_id)
      router.push({
        name: "PortfolioDetail",
        params: { port_id: portfolio.port_id, title: portfolio.title },
      });
    };

    const addPortfolio = () => {
      if (
        newPortfolio.value.title &&
        newPortfolio.value.description &&
        userId
      ) {
        let params = {
          owner_id: userId,
          name: encodeURIComponent(newPortfolio.value.title),
          description: encodeURIComponent(newPortfolio.value.description),
        };
        newPortfolio.value = [];
        itemModal.value = false;

        showSpinner.value = true;
        let url = base_url + "/portcreate/?" + formatParams(params);

        axios
          .post(url, {}, { headers: headers })
          .then(function (response) {
            fetchPortfolios();
          })
          .catch(function (error) {
            let errorCode = error.response.status;
            if (errorCode === 401) {
              router.push({ name: "Logout" });
            }
            console.log("error while adding portfolio: ", error.response);
          });
      } else {
        alert("Missing fields");
      }
    };

    const updatePortfolio = () => {
      if (targetPortfolio.value.title && targetPortfolio.value.description) {
        showSpinner.value = true;

        // send request to backend
        let params = {
          owner_id: userId,
          name: encodeURIComponent(targetPortfolio.value.title),
          description: encodeURIComponent(targetPortfolio.value.description),
        };

        let url =
          base_url +
          "/portupdate/" +
          targetPortfolio.value.port_id +
          "?" +
          formatParams(params);

        axios
          .put(url, {}, { headers: headers })
          .then(function (response) {
            fetchPortfolios();
          })
          .catch(function (error) {
            let errorCode = error.response.status;
            if (errorCode === 401) {
              router.push({ name: "Logout" });
            }
            console.log("error while updating portfolio: ", error.response);
          });

        targetPortfolio.value = {};
      } else {
        alert("missing fileds");
      }
    };

    const prepareData = (d) => {
      
      let data = JSON.parse(d);

      // convert the object into array of description, name, owner_id
      let description = Object.entries(data.description);
      let name = Object.entries(data.name);
      let owner_id = Object.entries(data.owner_id);

      let formatedData = [];
      for (let i = 0; i < description.length; i++) {
        formatedData.push({
          port_id: description[i][0],
          description: description[i][1],
          title: name[i][1],
          owner_id: owner_id[i][1],
        });
      }

      // Order the array of objects based on names
      formatedData.sort((a, b) =>
        a.title.toUpperCase() > b.title.toUpperCase()
          ? 1
          : b.title.toUpperCase() > a.title.toUpperCase()
          ? -1
          : 0
      );

      return formatedData;
    };

    return {
      portfolioList,
      targetPortfolio,
      newPortfolio,
      showModal,
      itemModal,
      deletePortfolio,
      edit,
      confirmDelete,
      redirectPortfolioDetail,
      addPortfolio,
      updatePortfolio,
      showSpinner,
      fetchPortfolios,
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
  padding: 20px 40px;
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

.new__item {
  background: rgba(255, 219, 106, 0.35);
}

.info {
  width: 50%;
}

.is-invalid {
  border: 1px solid crimson;
  border-radius: 7px;
}

.is-invalid:focus {
  border: 1px solid crimson;
  outline: none;
}

.invalid-feedback {
  font-size: 12px;
}

input {
  width: 100%;
  padding: 0 10px;
}

.disabled {
  pointer-events: none;
  color: grey !important;
}
</style>
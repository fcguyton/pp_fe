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
          <input class="in1" 
            type="text"
            placeholder="Enter portfolio name"
            v-model.trim="newPortfolio.title"
          />
        </h3>
        <p class="mt-3">
          <input class="in1" 
            type="text"
            placeholder="Enter a description of the portfolio"
            v-model.trim="newPortfolio.description"
          />
        </p>
      </div>
      <div class="info2">
          <input class="in2" 
            type="text"
            placeholder="Peak value"
            v-model.trim="newPortfolio.cppi_peak"
          />
          <input class="in2" 
            type="text"
            placeholder="Drawdown (%)"
            v-model.trim="newPortfolio.cppi_drawdown"
          />
          <input class="in2" 
            type="text"
            placeholder="Multiplier"
            v-model.trim="newPortfolio.cppi_multiplier"
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

        <div class="container" v-if="portfolio.cppi_peak">
          <div class="box">{{ portfolio.cppi_peak.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }}</div><br>
          <div class="box">{{ portfolio.cppi_drawdown }}</div><br>
          <div class="box">{{ portfolio.cppi_multiplier }}</div>
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
          <i
            class="fa fa-2x fa-clone ml-2"
            aria-hidden="true"
            @click="clonePortfolio(portfolio)"
          ></i>
        </div>
      </div>

      <!-- When edit button is pressed, show this -->
      <div v-else class="portfolio__item">
        <div class="info">
          <h3>
            <input class="in1"
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
        <div class="info2">
          <input class="in2"
          type="text"
          placeholder="Peak value"
          v-model.trim="targetPortfolio.cppi_peak"
          />
          <input class="in2"
          type="text"
          placeholder="Drawdown (%)"
          v-model.trim="targetPortfolio.cppi_drawdown"
          />
          <input class="in2"
          type="text"
          placeholder="Multiplier"
          v-model.trim="targetPortfolio.cppi_multiplier"
          />
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
    const newPortfolio = ref({title: '', description: '', cppi_peak: '', cppi_multiplier: '', cppi_drawdown: ''});
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
      // check if target portfolio has empty cppi values (i.e ' '), if so, remove them
      let cppi_peak = portfolio.cppi_peak === ' ' ? '' : portfolio.cppi_peak
      let cppi_drawdown = portfolio.cppi_drawdown === ' ' ? '' : portfolio.cppi_drawdown
      let cppi_multiplier = portfolio.cppi_multiplier === ' ' ? '' : portfolio.cppi_multiplier

      targetPortfolio.value = { ...portfolio, cppi_peak, cppi_drawdown, cppi_multiplier };
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

        // check if cppi values are empty, replace '' with ' ' so a valid
        let cppi_peak = newPortfolio.value.cppi_peak || ' '
        let cppi_drawdown = newPortfolio.value.cppi_drawdown || ' '
        let cppi_multiplier = newPortfolio.value.cppi_multiplier || ' '

        let params = {
          owner_id: userId,
          name: encodeURIComponent(newPortfolio.value.title),
          description: encodeURIComponent(newPortfolio.value.description),
          cppi_peak: encodeURIComponent(cppi_peak),
          cppi_drawdown: encodeURIComponent(cppi_drawdown),
          cppi_multiplier: encodeURIComponent(cppi_multiplier),
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

        // check if cppi values are empty, replace '' with ' ' so a valid
        let cppi_peak = targetPortfolio.value.cppi_peak || ' '
        let cppi_drawdown = targetPortfolio.value.cppi_drawdown || ' '
        let cppi_multiplier = targetPortfolio.value.cppi_multiplier || ' '

        // send request to backend
        let params = {
          owner_id: userId,
          name: encodeURIComponent(targetPortfolio.value.title),
          description: encodeURIComponent(targetPortfolio.value.description),
          cppi_peak: encodeURIComponent(cppi_peak),
          cppi_drawdown: encodeURIComponent(cppi_drawdown),
          cppi_multiplier: encodeURIComponent(cppi_multiplier),
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
        alert("missing fields");
      }
    };

    const clonePortfolio = (portfolio) => {

      // showSpinner.value = true;
      // targetPortfolio.value = portfolio;

      let url = base_url + "/portclone/" + portfolio.port_id; 
      console.log(url)

      axios
          .post(url, {}, { headers: headers })
          .then(function (response) {
            fetchPortfolios();
          })
          .catch(function (error) {
            console.log("error while cloning portfolio: ", error.response);
            let errorCode = error.response.status;
            if (errorCode === 401) {
              router.push({ name: "Logout" });
            }
          });

    };

    const prepareData = (d) => {
      
      let data = JSON.parse(d);

      // convert the object into array of description, name, owner_id
      let description = Object.entries(data.description);
      let name = Object.entries(data.name);
      let owner_id = Object.entries(data.owner_id);
      let cppi_peak = Object.entries(data.cppi_peak)
      let cppi_drawdown = Object.entries(data.cppi_drawdown)
      let cppi_multiplier = Object.entries(data.cppi_multiplier)

      let formatedData = [];
      for (let i = 0; i < description.length; i++) {
        formatedData.push({
          port_id: description[i][0],
          description: description[i][1],
          title: name[i][1],
          owner_id: owner_id[i][1],
          cppi_peak: cppi_peak[i][1],
          cppi_drawdown: cppi_drawdown[i][1],
          cppi_multiplier: cppi_multiplier[i][1],
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
      clonePortfolio,
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
  width: 60%;
}

.info2 {
  width: 20%;
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
  /* float: left; */
  /* padding: 6px 5px; */
  padding: 0 5px;
  text-align: right;
}

.disabled {
  pointer-events: none;
  color: grey !important;
}
</style>
<template>
  <header>
    <div class="header__content">
      <h1 class="heading">Portfolio Planner</h1>
    </div>
    <div class="links"></div>
  </header>
  <div class="alert alert-danger" role="alert" v-if="error.text">
    {{ error.text }}
  </div>
  <div class="form__container">
    <div class="w-75 m-auto text-left">
      <div class="form-group">
        <label for="exampleInputEmail1">Username</label>
        <input
          type="email"
          class="form-control"
          :class="{ 'is-invalid': error.username && !username }"
          placeholder="Enter username"
          v-model.trim="username"
        />
        <div class="invalid-feedback">
          {{ error.username }}
        </div>
      </div>
      <div class="form-group">
        <label for="exampleInputPassword1">Password</label>
        <input
          type="password"
          class="form-control"
          :class="{ 'is-invalid': error.password && !password }"
          placeholder="Enter password"
          v-model="password"
          @keyup.enter="login"
        />
        <div class="invalid-feedback">
          {{ error.password }}
        </div>
      </div>
    </div>
    <button
      class="btn btn-lg btn-success mt-3"
      @click="login"
    >
      Login
    </button>
  </div>
  <Spinner v-if="showSpinner" />
</template>

<script>
import { ref } from "@vue/reactivity";
import axios from "axios";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import Spinner from "@/components/Spinner";

export default {
  components: { Spinner },
  setup() {
    const username = ref("");
    const password = ref("");
    const error = ref({ text: "", username: "", password: "" });
    const showSpinner = ref(false);
    const store = useStore();
    const router = useRouter();
    var base_url = store.state.base_url;

    const login = () => {
      if (username.value && password.value) {
        getToken();
        showSpinner.value = true;
      } else {
        error.value.username = username.value ? "" : "Please enter username";
        error.value.password = password.value ? "" : "Please enter password";
      }
    };

    const getToken = () => {
      let url = base_url + "/login/";
      let auth = { username: username.value, password: password.value };
      showSpinner.value = true;
      error.value.text = "";

      axios
        .get(url, { auth: auth })
        .then(function (response) {
          let token = response.data.token;
          let userId = response.data.user_id;
          // save token to localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("user_id", userId);

          router.push({
            name: "Home",
          });
        })
        .catch(function (errorResponse) {
          showSpinner.value = false;
          try {
            let errorCode = errorResponse.response.status;
            if (errorCode === 401) {
              error.value.text = "Invalid credentials. Please type again";
            }
          } catch (err) {
            console.log(err);
            error.value.text =
              "Network Error! Please check your internet connection";
          }
        });
    };

    return { login, username, password, error, showSpinner };
  },
};
</script>

<style scoped>
.form__container {
  background: whitesmoke;
  width: 50%;
  margin: 100px auto;
  padding: 100px 50px;
  border-radius: 14px;
  box-shadow: 2px 2px 5px 1px rgba(0, 0, 0, 0.2);
  font-size: 18px;
  font-weight: bold;
}

.disabled {
  pointer-events: none;
  color: #d3d3d3 !important;
  font-style: italic;
}
</style>
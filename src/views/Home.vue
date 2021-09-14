<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
  </div>
</template>

<script>
// @ is an alias to /src
import { useStore } from "vuex";
import { ref } from '@vue/reactivity';
import { useRouter } from "vue-router";

export default {
  setup(){
    const store = useStore();
    const router = useRouter();
    const isLogged = ref(store.getters["auth/getUserState"]);

    if(!isLogged.value){
      router.push({
        name: 'Login'
      })
    } else{
      router.push({
        name: 'Home'
      })
    }
  }
}
</script>

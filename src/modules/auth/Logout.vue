<template>
  <Spinner />
</template>

<script>
import { onMounted } from "@vue/runtime-core";
import { useRouter } from "vue-router";
import Spinner from "@/components/Spinner";
export default {
  components: { Spinner },
  setup() {
    const router = useRouter();

    onMounted: {
      localStorage.removeItem("token");

      router.push({
        name: "Login",
      });
    }
  },
};
</script>
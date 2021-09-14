<template>
  <!-- Modal -->
  <transition name="fade" appear>
    <div class="modal-overlay" @click="toggleModal"></div>
  </transition>
  <transition name="slide" appear>
    <div class="modal">
      <h1 class="text-danger">Are you sure to delete ?</h1>
      <h3 class="mt-5">{{ data.title || data.symbol }}</h3>
      <p class="mt-2">{{ data.description }}</p>
      <button class="btn btn-danger" @click="confirmDelete">Delete</button>
    </div>
  </transition>
</template>

<script>
export default {
  props: ["data"],
  data() {},
  methods: {
    toggleModal() {
      this.$emit("toggleModal");
    },
    confirmDelete() {
      this.$emit("confirmDelete");
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 98;
  background-color: rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 99;

  width: 100%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 16px;

  padding: 25px;
  display: block;
  height: fit-content;
}

.modal > p {
  font-size: small;
  font-style: italic;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s;
}

.slide-enter,
.slide-leave-to {
  transform: translateY(-50%) translateX(100vw);
}
</style>

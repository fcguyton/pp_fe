<template>
  <div class="dropdown">
    
		<a href="#"
			class="dropdown-toggle"
      id="dropdownMenuButton"
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false"
		>
      {{ title }}
    </a>
    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
      <a
        v-for="option in options"
        :key="option"
        class="dropdown-item"
        href="#"
				@click="optionSelected(option)"
        >{{ option }}</a
      >
    </div>
  </div>
</template>

<script>
export default {
  name: "DropdownList",
  props: ["options", "title"],
	methods: {
		optionSelected(option) {
			this.$emit("optionSelected", option)
		}
	}
};
</script>

<style scoped>
</style>
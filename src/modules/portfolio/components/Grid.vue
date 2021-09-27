<template>
  <!-- create a table and display the data in the form of grid -->
  <div class="table_container">
    <table class="table table-striped table-light">
      <thead>
        <tr>
          <th v-for="key in keys" :key="key">{{ key }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="dataPoint in data" :key="dataPoint.Date">
          <td v-for="(value, name) in dataPoint" :key="name">
            {{ value }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "Grid",
  props: ["keys", "data"],
};
</script>

<style scoped>
.table_container {
  height: 500px;
  overflow-y: scroll;
}

th {
  position: sticky;
  top: 0;
  background: #d0f0c0;
}
</style>
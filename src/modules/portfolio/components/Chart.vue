<template>
  <section class="graph">
    <apexchart
      type="line"
      height="500"
      :options="options"
      :series="data"
    ></apexchart>
  </section>
</template>

<script>
import dayjs from "dayjs";

export default {
  props: ["data", "date"],
  data: function () {
    return {
      options: {
        chart: {
          id: "vuechart-example",
        },
        xaxis: {
          type: "datetime",
          categories: this.date,
          labels: {
            show: true,
            rotate: -45,
            hideOverlappingLabels: true,
            style: {
              colors: [],
              fontSize: "12px",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 400,
            },
            formatter: function (value, timestamp, opts){
              return dayjs(timestamp).format('MM/DD/YY')
            },
          },
        },
        yaxis: {
          decimalsInFloat: 3,
        },
        stroke: {
          width: 2,
        },
        noData: {
          text: "Loading...",
          align: "center",
          verticalAlign: "middle",
          offsetX: 0,
          offsetY: 0,
          style: {
            color: "#42b983",
            fontSize: "28px",
            fontFamily: undefined,
          },
        },
      },
    };
  },
};
</script>

<style scoped>
</style>
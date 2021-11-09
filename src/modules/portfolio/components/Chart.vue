<template>
  <section class="chart">
    <apexchart
      type="line"
      height="600"
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
              return dayjs(timestamp).format('MMM YYYY')
            },
          },
        },
        yaxis: {
          labels: {
            formatter: function (value) {
              return value.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
          },
        },


        tooltip: {
          followCursor: true,
          custom: function({series, seriesIndex, dataPointIndex, w}) {
            return '<div class="arrow_box">' +
                '<span>' + w.globals.seriesNames[seriesIndex] + ': ' + series[seriesIndex][dataPointIndex].toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '</span>' +
                '</div>'
          }
        },

        legend: {
          position: 'right',
          offsetY: 30
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


<style>

#chart {
  max-width: 5000px;
  margin: 35px auto;
  opacity: 0.9;
}

.arrow_box {
  position: relative;
  background: #ffffcc;
  border: 1px solid #000000;
  padding-left: 5px;
  padding-right: 5px;
}
.arrow_box:after, .arrow_box:before {
  right: 100%;
  top: 50%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}

.arrow_box:after {
  border-color: rgba(85, 85, 85, 0);
  border-right-color: #555;
  border-width: 10px;
  margin-top: -10px;
}
.arrow_box:before {
  border-color: rgba(0, 0, 0, 0);
  border-right-color: #000000;
  border-width: 13px;
  margin-top: -13px;
}

#chart .apexcharts-tooltip {
  color: #fff;
  transform: translateX(10px) translateY(10px);
  overflow: visible !important;
  white-space: normal !important;
}

#chart .apexcharts-tooltip span {
  padding: 5px 10px;
  display: inline-block;
}

</style>
<template>
  <div class="card">
    <div class="card-header" v-if="$slots.header">
      <slot name="header"></slot>
    </div>
    <div class="card-body">
      <div :id="chartId" class="ct-chart"></div>
    </div>
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
  import Card from './Card.vue'

  export default {
    name: 'chart-card',
    components: {
      Card
    },
    props: {
      chartType: {
        type: String,
        default: 'Line' // Line | Pie | Bar | StackedBar
      },
      chartOptions: {
        type: Object,
        default: () => ({
          // Default options for stacked bar chart
          stackBars: false,
        })
      },
      chartData: {
        type: Object,
        default: () => ({
          labels: [],
          series: []
        })
      },
      responsiveOptions: [Object, Array]
    },
    data() {
      return {
        chartId: 'no-id',
        $Chartist: null,
        chart: null
      }
    },
    methods: {
      /**
       * Initializes the chart by merging the chart options sent via props and the default chart options.
       */
      initChart() {
        const chartIdQuery = `#${this.chartId}`;
        this.chartOptions.stackBars = this.chartType === 'StackedBar';
        this.chart = this.$Chartist[this.chartType.replace('StackedBar', 'Bar')](chartIdQuery, this.chartData, this.chartOptions, this.responsiveOptions);
        this.$emit('initialized', this.chart);
        this.chartOptions.stackBars = this.chartType === 'StackedBar';
this.chart = this.$Chartist[this.chartType.replace('StackedBar', 'Bar')](
  chartIdQuery,
  this.chartData,         // ✅ Make sure this has series as [{ data: [...], className: ... }]
  this.chartOptions,
  this.responsiveOptions
);

        if (this.chartType === 'Line') {
          this.animateLineChart();
        } else if (this.chartType === 'Bar') {
          this.animateBarChart();
        } else if (this.chartType === 'StackedBar') {
          this.animateStackedBarChart();
        }
      },
      /**
       * Assigns a random ID to the chart.
       */
      updateChartId() {
        const currentTime = new Date().getTime().toString();
        const randomInt = this.getRandomInt(0, currentTime);
        this.chartId = `div_${randomInt}`;
      },
      getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      },
      animateLineChart() {
        let seq = 0;
        let durations = 20;
        let delays = 5;
        this.chart.on('draw', (data) => {
          if (data.type === 'line' || data.type === 'area') {
            data.element.animate({
              d: {
                begin: 600,
                dur: 700,
                from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
                to: data.path.clone().stringify(),
                easing: this.$Chartist.Svg.Easing.easeOutQuint
              }
            });
          } else if (data.type === 'point') {
            seq++;
            data.element.animate({
              opacity: {
                begin: seq * delays,
                dur: durations,
                from: 0,
                to: 1,
                easing: 'ease'
              }
            });
          }
        });
        seq = 0;
      },
      animateBarChart() {
        // let seq = 0;
        // let durations = 500;
        // let delays = 80;
        // this.chart.on('draw', (data) => {
        //   if (data.type === 'bar') {
        //     seq++;
        //     data.element.animate({
        //       opacity: {
        //         begin: seq * delays,
        //         dur: durations,
        //         from: 0,
        //         to: 1,
        //         easing: 'ease'
        //       }
        //     });
        //   }
        // });
      },
      animateStackedBarChart() {
        // let seq = 0;
        // let durations = 500;
        // let delays = 80;
        // this.chart.on('draw', (data) => {
        //   if (data.type === 'bar') {
        //     seq++;
        //     data.element.animate({
        //       y2: {
        //         begin: seq * delays,
        //         dur: durations,
        //         from: data.y1,
        //         to: data.y2,
        //         easing: 'easeInOutQuart'
        //       },
        //       opacity: {
        //         begin: seq * delays,
        //         dur: durations,
        //         from: 0,
        //         to: 1,
        //         easing: 'ease'
        //       }
        //     });
        //   }
        // });
      }
    },
    async mounted() {
  this.updateChartId();
  
  try {
    const Chartist = await import('chartist');
    this.$Chartist = Chartist.default || Chartist;

    this.$nextTick(() => {
      const chartElement = document.getElementById(this.chartId);
      if (!chartElement) {
        console.error(`Element with id ${this.chartId} not found.`);
        return;
      }

      this.initChart(); // Khởi tạo biểu đồ lần đầu
      this.chart.update(this.chartData, this.chartOptions); // Cập nhật dữ liệu ngay sau khi khởi tạo

      const resizeObserver = new ResizeObserver(() => {
        if (this.$Chartist && this.chart) { 
          this.chart.update(this.chartData, this.chartOptions); // Cập nhật khi thay đổi kích thước
        }
      });
      resizeObserver.observe(chartElement);
    });
  } catch (error) {
    console.error("Failed to load Chartist:", error);
  }
}


  }
</script>

<style>
/* Add any necessary styles for chart-container here */
.ct-series-a .ct-bar { stroke: #17a2b8; } /* CDS */
.ct-series-b .ct-bar { stroke: #dc3545; } /* ABC */
.ct-series-c .ct-bar { stroke: #ffc107; } /* KT */
.ct-series-d .ct-bar { stroke: #6f42c1; } /* CSKH */
.ct-series-e .ct-bar { stroke: #28a745; } /* SXKD */
/* Add any necessary 5 styles for chart-container here */
.ct-series-f .ct-bar { stroke: #007bff; } /* Kế toán */
.ct-series-g .ct-bar { stroke: #fd7e14; } /* Nhân sự */
.ct-series-h .ct-bar { stroke: #6610f2; } /* Hành chính */
.ct-series-i .ct-bar { stroke: #6c757d; } /* IT */
.ct-series-j .ct-bar { stroke: #17a2b8; } /* CDS */




</style>

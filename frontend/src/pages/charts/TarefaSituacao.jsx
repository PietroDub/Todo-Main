import React from 'react'
import ReactApexChart from 'react-apexcharts'
import '../../index.css'

const ApexChart = () => {
  const [state, setState] = React.useState({
    series: [44, 55, 41, 17, 15],
    options: {
      chart: {
        type: 'donut',
        height: 380,
      },
      labels: ['Comedy', 'Action', 'SciFi', 'Drama', 'Horror'],
      colors: ['#6366F1', '#0EA5E9', '#22C55E', '#F59E0B', '#EF4444'],
      plotOptions: {
        pie: {
          borderRadius: 8,
          spacing: 3,
          donut: {
            size: '62%',
          },
        },
      },
      stroke: {
        width: 0,
      },
      legend: {
        position: 'bottom',
      },
      title: {
        text: 'Rounded, spaced donut slices',
        align: 'left',
      },
    },
  })

  return (
    <div>
      <div id="chart">
        <ReactApexChart
          options={state.options}
          series={state.series}
          type="donut"
          height={380}
        />
      </div>
    </div>
  )
}

export default ApexChart

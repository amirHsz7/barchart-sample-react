import * as d3 from 'd3'
var url = './data.json'
const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 }
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM
var time = 0
export default class D3Chart {
	constructor(element) {
		const vis = this

		vis.svg = d3.select(element).append("svg")
				.attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
				.attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
			.append("g")
				.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)
		
		// Scales
			vis.x = d3.scaleLog()
			.base(10)
			.range([0, WIDTH])
			.domain([142, 150000])
			vis.y = d3.scaleLinear()
			.range([HEIGHT, 0])
			.domain([0, 90])
			vis.area = d3.scaleLinear()
			.range([25*Math.PI, 1500*Math.PI])
			.domain([2000, 1400000000])
			vis.continentColor = d3.scaleOrdinal(d3.schemePastel1)	
		// Labels
		vis.xLabel = vis.svg.append("text")
		.attr("y", HEIGHT + 50)
		.attr("x", WIDTH / 2)
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.text("GDP Per Capita ($)")
		vis.yLabel = vis.svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", -40)
		.attr("x", -170)
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.text("Life Expectancy (Years)")
		vis.timeLabel = vis.svg.append("text")
		.attr("y", HEIGHT - 10)
		.attr("x", WIDTH - 40)
		.attr("font-size", "40px")
		.attr("opacity", "0.4")
		.attr("text-anchor", "middle")
		.text("1800")


		// X Axis
		const xAxisCall = d3.axisBottom(vis.x)
		.tickValues([400, 4000, 40000])
		.tickFormat(d3.format("$"));
		vis.svg.append("g")
		.attr("class", "x axis")
		.attr("transform", `translate(0, ${HEIGHT})`)
		.call(xAxisCall)

		// Y Axis
		const yAxisCall = d3.axisLeft(vis.y)
		vis.svg.append("g")
		.attr("class", "y axis")
		.call(yAxisCall)

		d3.json(url)
		.then(data=>{
			// clean data
			
			var formattedData = data.map(year => {
				return year["countries"].filter(country => {
					const dataExists = (country.income && country.life_exp)
					return dataExists
				}).map(country => {
					country.income = Number(country.income)
					country.life_exp = Number(country.life_exp)
					return country
				})
			})
		
			// run the code every 0.1 second
			d3.interval(function(){
				time = (time < 214) ? time + 1 : 0
				vis.update(formattedData[time])
			}, 100)
		
			// first run of the visualization
			vis.update(formattedData[0])
		})

	}

	update(data) {
		const vis = this
		
		// standard transition time for the visualization
			const t = d3.transition()
			.duration(100)

		// JOIN new data with old elements.
		const circles = vis.svg.selectAll("circle")
			.data(data, d => d.country)

		// EXIT old elements not present in new data.
		circles.exit().remove()

		// ENTER new elements present in new data.
		
		circles.enter().append("circle")
			.attr("fill", d => vis.continentColor(d.continent))
			.merge(circles)
			.transition(t)
				.attr("cy", d => vis.y(d.life_exp))
				.attr("cx", d => vis.x(d.income))
				.attr("r", d => Math.sqrt(vis.area(d.population) / Math.PI))

		// update the time label
		vis.timeLabel.text(String(time + 1800))
		
	}
}
const margin = { top: 20, left: 50, right: 20, bottom: 20 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;


let data;
let reverse = false;
let type = d3.select('#group-by').node().value;

const svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const xScale = d3
  .scaleBand()
  .rangeRound([0, width])
  .paddingInner(0.1);

const yScale = d3.scaleLinear().range([height, 0]);

svg.append('g')
  .attr('class', 'axis x-axis')
  .attr("transform", "translate(0," + height + ")");

svg.append('g')
  .attr('class', 'axis y-axis');

svg.append("text")
    .attr("class", "y-axis-title")
    .attr("text-anchor", "middle")
    .attr('font-size', '12px')
    .attr("y", -10)
    .attr("x", 0);

function update(data, type, reverse){
  
  console.log('data', data);

  data.sort((a, b)=>b[type] - a[type]);  
  
  if (reverse){
    data.reverse();
  }
  
  xScale.domain(data.map(d=>d.company));
  
  console.log(xScale.domain())
  
  
  yScale.domain([0, d3.max(data,d=>d[type])]);
  
 
  const bars = svg.selectAll('.bar')
    .data(data, d=>d.company);
  
  bars.enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('fill', '#1f76b4')
    .attr('x', d=>xScale(d.company))
    .attr('width', d=>xScale.bandwidth())
  	.attr("height",0)
	  .attr("y",height)
    .merge(bars)
    .transition()
    .delay((d,i)=>i*100)
    .duration(1000)
    .attr('x', d=>xScale(d.company))
    .attr('y', d=>yScale(d[type]))
    .attr('height', d=>height-yScale(d[type]))
  
  bars.exit().remove();
  
  const xAxis = d3.axisBottom(xScale);
  
  svg.select('.x-axis')
    .transition()
    .duration(1000)
    .call(xAxis);
  
  const yAxis = d3.axisLeft(yScale);
  
  svg.select('.y-axis')
    .transition()
    .duration(1000)
    .call(yAxis);
  
  d3.select('.y-axis-title').text(type==="stores"? "Stores" : "Billion USD");

  console.log('type: ', type);

  // ACCESSIBILITY
  d3.select('.chart')
    .attr('role', 'graphics-document')
    .attr('aria-roledescription', 'bar chart');  

  if (type == 'stores') {
    d3.select('.chart')
      .attr('aria-label', 
      `Bar chart of Coffee House chains by number of stores. 
      Starbucks leads with 20,000, Dunkin is next with 11,000,
      Tim Hortons has 4,500, and the rest have less than 4,000 stores.
    `);
  } else {
    d3.select('.chart')
      .attr('aria-label', 
      `Bar chart of Coffee House chains by annual revenue. 
      Starbucks leads with 16 million, Tim Hortons is next with 3 million,
      Parena Bread is just under 3 million, and the rest have less
      than 1 million in revenue per year.
      `);
  }

  d3.selectAll('.bar')
    .attr('role', 'graphics-symbol')
    .attr('aria-roledescription', 'bar element');

  d3.selectAll('.bar')
    .attr('aria-label', d => `${d.company + d[type]}`);

  d3.selectAll('.chart')
    .attr('tabindex', 0);

  d3.select('.x-axis')
    .attr('aria-hidden', true);

  d3.select('.y-axis')
    .attr('aria-hidden', true);

  d3.selectAll('.button')
    .attr('role', 'Button to sort data')
    .attr('aria-label', 'sort');
}


d3.csv("coffee-house-chains.csv", d3.autoType).then(_data => {
  data = _data;
  update(data, type, reverse);
  
});


d3.select('#group-by').on('change', (event)=>{
  type = d3.select('#group-by').node().value;
  update(data, type, reverse);
})

d3.select('#sort-btn').on('click', (event)=>{
  console.log('sort button clicked');
  reverse = !reverse;
  update(data, type, reverse);
})
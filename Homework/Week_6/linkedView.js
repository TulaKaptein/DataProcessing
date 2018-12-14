// Name: Tula Kaptein
// Studentnumber: 11013478

var totalEnergyConsumption = "TotalEnergyConsumption.json"
var naturalGasConsumption = "NaturalGasConsumption.json"
var liquidConsumption = "PetroleumOtherLiquidsConsumption.json"
var nuclearConsumption = "NuclearRenewablesOtherConsumption.json"
var coalConsumption = "CoalConsumption.json"
var europa = "europeFile.json"

window.onload = function() {
  var requests = [d3.json(europa), d3.json(totalEnergyConsumption),
    d3.json(naturalGasConsumption), d3.json(liquidConsumption),
    d3.json(nuclearConsumption),
    d3.json(coalConsumption)];

  Promise.all(requests).then(function(response) {
      main(response);
  }).catch(function(e){
      throw(e);
  });

};

function main (response){
  var format = d3.format(",");

  var countries = response[0]
  var energyConsumption = response[1]
  var naturalGasConsumption = response[2]
  var liquidConsumption = response[3]
  var nuclearConsumption = response[4]
  var coalConsumption = response[5]

  var margin = {top: 10, right: 10, bottom: 10, left: 10},
              width = 960 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;

  var colors = ['rgb(255,247,236)','rgb(254,232,200)','rgb(253,212,158)','rgb(253,187,132)','rgb(252,141,89)','rgb(239,101,72)','rgb(215,48,31)','rgb(179,0,0)','rgb(127,0,0)']
  var color = d3.scaleThreshold()
      .domain([0,2,5,7,10,15,20,25,35])
      .range(colors);

  var path = d3.geoPath();

  var europe = d3.select("body")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .append('g')
              .attr('class', 'map');

  var projection = d3.geoMercator()
                     .scale(150)
                     .translate( [200, 400]);

  var path = d3.geoPath().projection(projection);

  var energyConsumptionByCountry = {}

  for (item in energyConsumption){
    energyConsumptionByCountry[item] = energyConsumption[item][2016]
  }
  countries.features.forEach(function(d) {d.energyConsumption = energyConsumptionByCountry[d.properties.name]})

  // Set tooltips
  var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([0, 70])
              .html(function(d) {
                return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Energy Consumption: </strong><span class='details'>" + format(d.energyConsumption) +" (quadrillion BTU)</span>";
              })

  europe.call(tip);

  // set the dimensions and margins of the graph
  var margin2 = {top: 61, right: 200, bottom: 101, left: 50},
    width = 960 - margin2.left - margin2.right,
    height = 500 - margin2.top - margin2.bottom;

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var chart = d3.select("body").append("svg")
      .attr("width", width + margin2.left + margin2.right)
      .attr("height", height + margin2.top + margin2.bottom)
      .append("g")
      .attr("transform",
            "translate(" + margin2.left + "," + margin2.top + ")");
  // set the ranges
  var xScale = d3.scaleLinear().range([0, width]);
  var yScale = d3.scaleLinear().range([height, 0]);

  var data = collectData("Russia")

  chart.append("text")
      .attr("x", 150)
      .attr("y", 0)
      .attr("class", "plot-title")
      .text("Stacked area chart of the consumption of different kinds of energy in Russia")

  makeAxes(data)

  var attributes = ["gasConsumption", "coalConsumption", "liquidConsumption", "nuclearConsumption"]
  var legendData = ["Natural Gas", "Coal", "Petroleum and Other Liquids", "Nuclear, Renewables and Other"]
  fillAreas(data, attributes)
  makeLegend(legendData)

  // Set the axes titles
  chart.append("text")
     .attr("x", 0.75*width)
     .attr("y", height + margin2.top - 20)
     .attr("class", "axis-title")
     .text("Year");

  chart.append("text")
     .attr("transform", "rotate(-90)")
     .attr("x", -height + margin2.top + 20)
     .attr("y", -margin2.left + 15)
     .attr("class", "axis-title")
     .text("Consumption of energy (quadrillion BTU)");

//   chart.append("div")
//        .attr("id", "toolLine")
//
//   var tooltip = chart.select("#toolLine")
//   var tooltipLine = chart.append('line');
//   var tipBox = chart.append('rect')
//                     .attr('width', width)
//                     .attr('height', height)
//                     .attr('opacity', 0)
//                     .on('mousemove', drawTooltip())
//                     .on('mouseout', removeTooltip());
//
//   function removeTooltip() {
//     if (tooltip) tooltip.style('display', 'none');
//     if (tooltipLine) tooltipLine.attr('stroke', 'none');
//   }
//
// function drawTooltip() {
//   const year = Math.floor((x.invert(d3.mouse(tipBox.node())[0]) + 5) / 10) * 10;
//
//   states.sort((a, b) => {
//     return b.history.find(h => h.year == year).population - a.history.find(h => h.year == year).population;
//   })
//
//   tooltipLine.attr('stroke', 'black')
//     .attr('x1', x(year))
//     .attr('x2', x(year))
//     .attr('y1', 0)
//     .attr('y2', height);
//
//   tooltip.html(year)
//     .style('display', 'block')
//     .style('left', d3.event.pageX + 20)
//     .style('top', d3.event.pageY - 20)
//     .selectAll()
//     .data(states).enter()
//     .append('div')
//     .style('color', d => d.color)
//     .html(d => d.name + ': ' + d.history.find(h => h.year == year).population);
// }
//

  europe.append("g")
     .attr("class", "countries")
     .selectAll("path")
     .data(countries.features)
     .enter().append("path")
     .attr("d", path)
     .style("fill", function(d) { return color(energyConsumptionByCountry[d.properties.name]); })
     .style('stroke', 'white')
     .style('stroke-width', 1.5)
     .style("opacity",0.8)
     // tooltips
     .style("stroke","white")
     .style('stroke-width', 0.3)
     .on('mouseover',function(d){
        tip.show(d);

        d3.select(this)
          .style("opacity", 1)
          .style("stroke","white")
          .style("stroke-width",3);
     })
     .on('mouseout', function(d){
       tip.hide(d);

       d3.select(this)
         .style("opacity", 0.8)
         .style("stroke","white")
         .style("stroke-width",0.3);
     })
     .on('click', function(d){
       return actionClick(d.properties.name, chart);
     });

  europe.append("path")
      .datum(topojson.mesh(countries.features, function(a, b) { return a.id !== b.id; }))
      .attr("class", "names")
      .attr("d", path);

    function actionClick(country, chart){

      // Update the title
      chart.select(".plot-title")
         .text("Stacked area chart of the consumption of different kinds of energy in " + country)

      // Get the data
      var data = collectData(country)

      var attributes = ["gasConsumption", "coalConsumption", "liquidConsumption", "nuclearConsumption"]

      // Scale the range of the data
      xScale.domain(d3.extent(data, function(d) {
        return d.year;
      }));
      maxY = d3.max(data, function(d){
        return d.totalConsumption;
      })
      yScale.domain([0,Math.ceil(maxY/5)*5])

      updateAreas(data, attributes)
      updateAxes(data)

      function updateAxes(data){
        // Add the X Axis
        chart.select(".x-axis")
            .transition()
            .duration(1000)
            .call(d3.axisBottom(xScale).tickFormat(d3.format('.4')))


        // Add the Y Axis
        chart.select(".y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(yScale));
      }
      function updateAreas (data, attributes){
        // let t = d3.transition().duration(1000)
        for (item in attributes){
          var area = d3.area()
            .x(function(d){ return xScale(d.year)})
            .y0(function(d){ return yScale(d[attributes[item] + "0"])})
            .y1(function(d){ return yScale(d[attributes[item] + "0"] + d[attributes[item]])})

          let areaTransition = chart.select("#" + attributes[item])
                         .data([data])
                         .transition()
                         .duration(1000)
                         .attr("d", area)

        }
      }
    }
    function makeLegend(attributes){
      chart.selectAll("legendPoint")
         .data(attributes)
         .enter()
         .append("circle")
         .attr("class", "legendPoint")
         .attr("fill", function(d, i){
           return getColor(i)
         })
         .attr("cx", margin2.left + width - 10)
         .attr("cy", function(d, i){
           return margin2.top + 10 + 15*i
         })
         .attr("r", 3)

      chart.selectAll("legendText")
         .data(attributes)
         .enter()
         .append("text")
         .attr("class", "legendText")
         .attr("x", margin2.left + width)
         .attr("y", function(d,i){
           return margin2.top + 15 + 15*i
         })
         .text(function(d){
           return d
         })
    }
    function makeAxes(data) {
      // Scale the range of the data
      xScale.domain(d3.extent(data, function(d) {
        return d.year;
      }));
      maxY = d3.max(data, function(d){
        return d.totalConsumption;
      })
      yScale.domain([0,Math.ceil(maxY/5)*5])

      // Add the X Axis
      chart.append("g")
          .attr("transform", "translate(0," + height + ")")
          .attr("class", "x-axis")
          .call(d3.axisBottom(xScale).tickFormat(d3.format('.4')))


      // Add the Y Axis
      chart.append("g")
          .attr("class", "y-axis")
          .call(d3.axisLeft(yScale));

      }
    function collectData(country){
      var consumptionCountry = energyConsumption[country]
      var gasconsumptionCountry = naturalGasConsumption[country]
      var liquidconsumptionCountry = liquidConsumption[country]
      var nuclearconsumptionCountry = nuclearConsumption[country]
      var coalConsumptionCountry = coalConsumption[country]

      data = []
      for (year in consumptionCountry){
        if (nuclearconsumptionCountry[year] != null){
          data.push({"year": year, "totalConsumption": consumptionCountry[year],
          "gasConsumption": gasconsumptionCountry[year],
          "coalConsumption": coalConsumptionCountry[year],
          "liquidConsumption":liquidconsumptionCountry[year],
          "nuclearConsumption": parseFloat(nuclearconsumptionCountry[year]),
        "gasConsumption0": 0, "coalConsumption0": gasconsumptionCountry[year], "liquidConsumption0": gasconsumptionCountry[year] + coalConsumptionCountry[year], "nuclearConsumption0": gasconsumptionCountry[year] + coalConsumptionCountry[year] + liquidconsumptionCountry[year]})
        }
      }
      return data

    }
    function fillAreas(data, attributes){
      for (item in attributes){
        var area = d3.area()
          .x(function(d){ return xScale(d.year)})
          .y0(function(d){ return yScale(d[attributes[item] + "0"])})
          .y1(function(d){ return yScale(d[attributes[item] + "0"] + d[attributes[item]])})

        chart.append("path")
            .data([data])
            .attr("class", "line")
            .attr("id", attributes[item])
            .attr("d", area)
            .attr("fill", getColor(item))
      }
    }
    function getColor(n){
      colors = ['rgb(215,25,28)','rgb(253,174,97)','rgb(255,255,191)','rgb(171,217,233)','rgb(44,123,182)']
      return colors[n]
    }

}

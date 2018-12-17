// Name: Tula Kaptein
// Studentnumber: 11013478

var totalEnergyConsumption = "TotalEnergyConsumption.json"
var naturalGasConsumption = "NaturalGasConsumption.json"
var liquidConsumption = "PetroleumOtherLiquidsConsumption.json"
var nuclearConsumption = "NuclearRenewablesOtherConsumption.json"
var coalConsumption = "CoalConsumption.json"
var europa = "europeFile.json"

var currentData;

// Load in the data files
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

  // Set variables for the datasets
  var countries = response[0]
  var energyConsumption = response[1]
  var naturalGasConsumption = response[2]
  var liquidConsumption = response[3]
  var nuclearConsumption = response[4]
  var coalConsumption = response[5]

  // Set the margin for the first graph
  var margin = {top: 10, right: 10, bottom: 10, left: 10},
              width = 960 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;
  var domainEurope = ["0 - 2 quadrillion BTU", "2 - 5 quadrillion BTU","5 - 7 quadrillion BTU", "7 - 10 quadrillion BTU", "10 - 15 quadrillion BTU", "15 - 20 quadrillion BTU", "20 - 25 quadrillion BTU", "25 - 35 quadrillion BTU", "> 35 quadrillion BTU"]

  // Set the colours and the domain for the Europe map graph
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
  makeEuropeLegend(domainEurope, colors)

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

  // Set the dimensions and margins of the second graph
  var margin2 = {top: 60, right: 200, bottom: 101, left: 50},
    width = 960 - margin2.left - margin2.right,
    height = 500 - margin2.top - margin2.bottom;

  var chart = d3.select("body").append("svg")
      .attr("width", width + margin2.left + margin2.right)
      .attr("height", height + margin2.top + margin2.bottom)
      .append("g")
      .attr("transform",
            "translate(" + margin2.left + "," + margin2.top + ")");

  const tooltip = chart.append("div")
                       .attr("class", "tooltip")

  // Set the ranges of the scales
  var xScale = d3.scaleLinear().range([0, width]);
  var yScale = d3.scaleLinear().range([height, 0]);

  var data = collectData("Netherlands")
  currentData = data;

  // Set the chart title
  chart.append("text")
      .attr("x", 100)
      .attr("y", 0)
      .attr("class", "plot-title")
      .text("Stacked area chart of the consumption of different kinds of energy in Netherlands")

  // Make the axes
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

  // Draw the map of Europe
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

 // Set an optional title for the europe map
 europe.append("text")
       .attr("class", "plot-title")
       .attr("x", width/2)
       .attr("y", height)
       .text(" ")

    // Function that gets called when a country is clicked
    function actionClick(country, chart){

      if (country == "Ukraine" || country == "Moldova"){
        europe.select(".plot-title")
             .text("No further data available for " + country)
      } else {
        europe.select(".plot-title")
             .text("")
          // Update the title
          chart.select(".plot-title")
             .text("Stacked area chart of the consumption of different kinds of energy in " + country)

          // Get the data
          var data = collectData(country)
          currentData = data;

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
        }
    }

      // Function that transitions the axes
      function updateAxes(data){

        // Transition the X Axis
        chart.select(".x-axis")
            .transition()
            .duration(1000)
            .call(d3.axisBottom(xScale).tickFormat(d3.format('.4')))

        // Transition the Y Axis
        chart.select(".y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(yScale));
      }

      // Function that transitions the areas in the chart
      function updateAreas (data, attributes){

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

    // Function that makes the legend of the Europe map
    function makeEuropeLegend(domain, colors){

      // Make the rectangles for the legend
      europe.selectAll("legendPoint")
         .data(colors)
         .enter()
         .append("rect")
         .attr("class", "legendPoint")
         .attr("fill", function(d){
           return d;
         })
         .attr("x", margin.left)
         .attr("y", function(d, i){
           return margin.top + 15*i;
         })
         .attr("height", 15)
         .attr("width", 15)

      // Make the text for the legend
      europe.selectAll("legendText")
         .data(domain)
         .enter()
         .append("text")
         .attr("class", "legendText")
         .attr("x", margin.left + 20)
         .attr("y", function(d,i){
           return margin.top + 10 + 15*i;
         })
         .text(function(d, i){
           return d;
         })

    }

    // Function that makes the legend for the area chart
    function makeLegend(attributes){

      // Make the circles for the legend
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

      // Make the text for the legend
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

    // Function that makes the axes
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

    // Function that collects the data for a certain country
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

    // Function that fills the areas in the area chart
    function fillAreas(data, attributes){
      var bisectDate = d3.bisector(function(d){
        return d.year;
      }).left
      var div = d3.select("body")
                  .append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

      for (item in attributes){
        var area = d3.area()
          .x(function(d){ return xScale(d.year)})
          .y0(function(d){ return yScale(d[attributes[item] + "0"])})
          .y1(function(d){ return yScale(d[attributes[item] + "0"] + d[attributes[item]])})

        chart.append("path")
            .data([data])
            .attr("class", "area")
            .attr("id", attributes[item])
            .attr("d", area)
            .attr("fill", getColor(item))

        // Implement tooltip
        var focus = chart.append("g")
                .attr("class", "focus")
                .style("display", "none");

            focus.append("circle")
                .attr("r", 5);

            focus.append("text")
                .attr("x", -9)
                .style("text-anchor", "end")
                .attr("dy", ".35em")
                .style("font-size",15);

            var focus2 = chart.append("g")
                .attr("class", "focus")
                .style("display", "none");

            focus2.append("circle")
                .attr("r",5);

            focus2.append("text")
                .attr("x", 9)
                .attr("dy", ".35em")
                .style("font-size",15);

            var focus3 = chart.append("g")
                .attr("class", "focus")
                .style("display", "none");

            focus3.append("circle")
                .attr("r", 5);

            focus3.append("text")
                .attr("x", -9)
                .style("text-anchor", "end")
                .attr("dy", ".35em")
                .style("font-size",15);

            var focus4 = chart.append("g")
                .attr("class", "focus")
                .style("display", "none");

            focus4.append("circle")
                .attr("r", 5);

            focus4.append("text")
                .attr("x", 9)
                .attr("dy", ".35em")
                .style("font-size",15);

      chart.append("rect")
                .attr("class", "overlay")
                .attr("width", width)
                .attr("height", height)
                .on("mouseover", function() {
                    focus.style("display", null);
                    focus2.style("display", null);
                    focus3.style("display", null);
                    focus4.style("display", null);
                })
                .on("mouseout", function() {
                    focus.style("display", "none");
                    focus2.style("display", "none");
                    focus3.style("display", "none");
                    focus4.style("display", "none");
                })
                .on("mousemove", mousemove);

            function mousemove() {

                var x0 = xScale.invert(d3.mouse(this)[0]),
                    i = bisectDate(currentData, x0, 1),
                    d0 = currentData[i - 1],
                    d1 = currentData[i],
                    d= x0 - d0.year > d1.year - x0 ? d1 : d0;

                  var gasCons=parseFloat(d['gasConsumption']);
                  var coalCons=parseFloat(d['coalConsumption0'])+parseFloat(d['coalConsumption']);
                  var liqCons=parseFloat(d['liquidConsumption0'])+parseFloat(d['liquidConsumption']);
                  var nucCons=parseFloat(d['nuclearConsumption0'])+parseFloat(d["nuclearConsumption"]);
                  focus.attr("transform", "translate(" + xScale(d.year) + "," + yScale(gasCons)+ ")");
                  focus2.attr("transform", "translate(" + xScale(d.year) + "," + yScale(coalCons) + ")");
                  focus3.attr("transform", "translate(" + xScale(d.year) + "," + yScale(liqCons) + ")");
                  focus4.attr("transform", "translate(" + xScale(d.year) + "," + yScale(nucCons) + ")");

                  focus.select("text").text(Math.round(d['gasConsumption']*100)/100 + " quadrillion BTU");
                  focus2.select("text").text(Math.round(d['coalConsumption']*100)/100 + " quadrillion BTU");
                  focus3.select("text").text(Math.round(d['liquidConsumption']*100)/100 + " quadrillion BTU");
                  focus4.select("text").text(Math.round(d['nuclearConsumption']*100)/100 + " quadrillion BTU");

            }
    }
  }

    // Function that returns a color for the area chart
    function getColor(n){
      colors = ['rgb(215,25,28)','rgb(253,174,97)','rgb(255,255,191)','rgb(171,217,233)','rgb(44,123,182)']
      return colors[n]
    }

}

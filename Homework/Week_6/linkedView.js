// Name: Tula Kaptein
// Studentnumber: 11013478

var totalEnergyConsumption = "TotalEnergyConsumption.json"
var naturalGasConsumption = "NaturalGasConsumption.json"
var liquidConsumption = "PetroleumOtherLiquidsConsumption.json"
var nuclearConsumption = "NuclearRenewablesOtherConsumption.json"
var coalConsumption = "CoalConsumption.json"
var europa = "europeFile.json"

window.onload = function() {
  console.log("Yaazz")
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

  var svg = d3.select("body")
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

  console.log(countries)
  // Set tooltips
  var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([0, 70])
              .html(function(d) {
                return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Energy Consumption: </strong><span class='details'>" + format(d.energyConsumption) +" (quadrillion BTU)</span>";
              })

  svg.call(tip);

  svg.append("g")
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
       return actionClick(d.properties.name);
     });

  svg.append("path")
      .datum(topojson.mesh(countries.features, function(a, b) { return a.id !== b.id; }))
      .attr("class", "names")
      .attr("d", path);

    function actionClick(country){
      console.log(coalConsumption["Russia"])
      // Get the data
      var consumptionCountry = energyConsumption[country]
      var gasconsumptionCountry = naturalGasConsumption[country]
      var liquidconsumptionCountry = liquidConsumption[country]
      var nuclearconsumptionCountry = nuclearConsumption[country]
      var coalConsumptionCountry = coalConsumption[country]

      console.log(coalConsumptionCountry)

      var data = []
      for (year in consumptionCountry){
        if (consumptionCountry[year] != null){
          data.push({"year": year, "totalConsumption": consumptionCountry[year],
          "gasConsumption": gasconsumptionCountry[year],
          "liquidConsumption":liquidconsumptionCountry[year],
          "nuclearConsumption": parseFloat(nuclearconsumptionCountry[year]),
          "coalConsumption": coalConsumptionCountry[year]})
        }
      }
      console.log(data)

      // set the dimensions and margins of the graph
      var margin = {top: 61, right: 140, bottom: 101, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

      // set the ranges
      var xScale = d3.scaleLinear().range([0, width]);
      var yScale = d3.scaleLinear().range([height, 0]);

      // append the svg obgect to the body of the page
      // appends a 'group' element to 'svg'
      // moves the 'group' element to the top left margin
      var svg2 = d3.select("body").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

      makeLine("totalConsumption", getColor(0))
      makeLine("gasConsumption", getColor(1))
      makeLine("liquidConsumption", getColor(2))
      makeLine("nuclearConsumption", getColor(3))
      makeLine("coalConsumption", getColor(4))

      makeAxes(data)

    function makeLine(attribute, color){
        var valueline = d3.line()
          .x(function(d) { return xScale(d.year);})
          .y(function(d) {return yScale(d[attribute])});

        var area = d3.area()
          .x(function(d){ return xScale(d.year)})
          .y0(yScale(0))
          .y1(function(d){ return yScale(d[attribute])})
        // Scale the range of the data
        xScale.domain(d3.extent(data, function(d) {
            return d.year;
          }));
        yScale.domain([0, d3.max(data, function(d) {
        	  return d.totalConsumption; })]);

        console.log(data[0])
        // Add the valueline1 path.
        svg2.append("path")
            .data([data])
            .attr("class", "line")
            .attr("id", attribute)
            .attr("d", area)
            .attr("stroke", color)
            .attr("fill", color)
      }
    function makeAxes(data) {

      // Scale the range of the data
      xScale.domain(d3.extent(data, function(d) {
        return d.year;
      }));
      yScale.domain([0, d3.max(data, function(d) {
    	  return d.totalConsumption; })]);

      // Add the X Axis
      svg2.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(xScale));

      // Add the Y Axis
      svg2.append("g")
          .call(d3.axisLeft(yScale));
      }

    function makeAxes2(data) {

      var xBarScale = d3.scaleBand()
                        .domain(20)
                        .range([0,width])
      var yBarScale = d3.scaleLinear()
                        .domain([0, d3.max(data, function(d){
                          return d.totalConsumption
                        })])

      // Add the X Axis
      svg3.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(xScale));

      // Add the Y Axis
      svg3.append("g")
          .call(d3.axisLeft(yScale));
      }
    function makeBars(data) {
      var length = Object.keys(data).length
      var bars1 = svg3.selectAll("bar1")
          .data(data)
          .enter()
          .append("rect")
          .attr("class", "bar1")
          .attr("x", function(d, i){
            return i * (width/(length*4)) + margin.left;
          })
          .attr("y", function(d){
            return margin.top + yScale(d.totalConsumption)
          })
          .attr("width", width/(length*4))
          .attr("height", function(d){
            return height - yScale(d.totalConsumption);
          })
          .attr("fill", "pink");

       var bars2 = svg3.selectAll("bar2")
         .data(data)
         .enter()
         .append("rect")
         .attr("class", "bar2")
         .attr("x", function(d, i){
          return i * (width/(length*4)) + margin.left + 5;
         })
         .attr("y", function(d){
           return margin.top + yScale(d.gasConsumption)
         })
         .attr("fill", "blue")
         .attr("width", 5)
         .attr("height", function(d){
           return height - yScale(d.gasConsumption);
         })
       var bars3 = svg3.selectAll("bar3")
         .data(data)
         .enter()
         .append("rect")
         .attr("class", "bar3")
         .attr("x", function(d, i){
        return i * (width/(length*4)) + margin.left + 10;
         })
         .attr("y", function(d){
           return margin.top + yScale(d.liquidConsumption)
         })
         .attr("fill", "green")
         .attr("width", 5)
         .attr("height", function(d){
           return height - yScale(d.liquidConsumption);
         })
       var bars4 = svg3.selectAll("bar4")
         .data(data)
         .enter()
         .append("rect")
         .attr("class", "bar4")
         .attr("x", function(d, i){
        return i * (width/(length*4)) + margin.left + 15;
         })
         .attr("y", function(d){
           return margin.top + yScale(d.nuclearConsumption)
         })
         .attr("fill", "red")
         .attr("width", 5)
         .attr("height", function(d){
           return height - yScale(d.nuclearConsumption);
         })

    }

    function getColor(n){
      colors = ['rgb(215,25,28)','rgb(253,174,97)','rgb(255,255,191)','rgb(171,217,233)','rgb(44,123,182)']
      return colors[n]
    }



    }



}

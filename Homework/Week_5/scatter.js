// Name: Tula Kaptein
// Studentnumber: 11013478

var lifeExpectancyAndDeathRate = "https://data.cdc.gov/api/views/w9j2-ggv5/rows.json?accessType=DOWNLOAD"

window.onload = function() {

  var requests = [d3.json(lifeExpectancyAndDeathRate)];

  Promise.all(requests).then(function(response) {
      main(response);
  }).catch(function(e){
      throw(e);
  });

};

function main (response){
  var width = 700;
  var height = 400;
  var margin = {left:40, right:120, top: 60, bottom: 20};
  var legendPadding = 10;
  var xScale = d3.scaleLinear()
                 .range([0,width]);
  var yScale = d3.scaleLinear()
                 .range([height,0]);
  var data = response[0];
  var dataset = transformResponse(data);
  var svg = d3.select("body")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom);

  // Initialize the title of the scatter plot
  svg.append("text")
     .attr("x", 0.15*width)
     .attr("y", 30)
     .attr("class", "plot-title")
     .text("Scatter plot of the life expectancy and death rate in the USA for category: Both Sexes")

  // Set the axes titles
  svg.append("text")
     .attr("x", 0.75*width)
     .attr("y", height + margin.top - 10)
     .attr("class", "axis-title")
     .text("Average life expectancy (years)");

  svg.append("text")
     .attr("transform", "rotate(-90)")
     .attr("x", -height + margin.top)
     .attr("y", margin.left + 20)
     .attr("class", "axis-title")
     .text("Age adjusted death rate (per 100.000)");

  // Make the legend
  svg.append("rect")
             .attr("class", "legend")
             .attr("x", margin.left + width + legendPadding)
             .attr("y", margin.top + legendPadding)
             .attr("width", 100)
             .attr("height", 40);

  // Make lists of the different variables
  var races = ["All_Races", "Black", "White"];
  var sexes = ["Both Sexes", "Female", "Male"];
  var colors = ['rgb(27,158,119)','rgb(217,95,2)','rgb(117,112,179)'];
  var legendData = [];

  // Make the first plot
  makePlot("Both Sexes")

  // Make the buttons to choose the sex
  d3.select("#menu")
    .selectAll("button")
    .data(sexes)
    .enter()
    .append("button")
    .attr("class", "button")
    .text(function(d){
      return d;
    })
    .on('click', function(d){
      return updatePlot(d);
    })

  // Function to make the plot
  function makePlot(sex){

      makeAxes(sex);

      // Make the datapoints
      for (item in races){
        let array = makeArray(dataset, sex, races[item]);
        let points = svg.selectAll("point")
                        .data(array)
                        .enter()
                        .append("circle")
                        .attr("class", races[item])
                        .attr("cx", function(d){
                          return xScale(d.lifeExpectancy) + margin.left
                        })
                        .attr("cy", function(d){
                          return yScale(d.deathRate) + margin.top
                        })
                        .attr("r", 1.5)
                        .attr("fill", colors[item]);
        // Add the legend items
        legendItem = {name:races[item], color:colors[item]};
        legendData.push(legendItem);
      }
      makeLegend(legendData);
    }

  // Function to make the axes
  function makeAxes(sex){

      // Calculate the maximum x- and y-value
      var maxX = d3.max(dataset, function(d){
        if (d.sex == sex){
          return parseInt(d.lifeExpectancy)
        }
      })
      var maxY = d3.max(dataset, function(d){
        if (d.sex == sex){
          return parseInt(d.deathRate)
        }
      })

      // Set the domain to the rounded up value of the maximum x- and y-value
      xScale.domain([0, Math.ceil(maxX/10)*10])
      yScale.domain([0,Math.ceil(maxY/500)*500])

      var xAxis = d3.axisBottom(xScale);
      var yAxis = d3.axisLeft(yScale);

      // Make the axes
      svg.append("g")
         .attr("class", "x-axis")
         .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
         .call(xAxis);

      svg.append("g")
         .attr("class", "y-axis")
         .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
         .call(yAxis);
    }

  // Function to fill the legend
  function makeLegend(legendData){

      // Make the dots in the legend
      svg.selectAll("legendPoint")
         .data(legendData)
         .enter()
         .append("circle")
         .attr("class", "legendPoint")
         .attr("fill", function(d){
           return d.color
         })
         .attr("cx", margin.left + width + legendPadding + 10)
         .attr("cy", function(d, i){
           return margin.top + 10 + 10*i + legendPadding
         })
         .attr("r", 3)

      // Make the text in the legend
      svg.selectAll("legendText")
         .data(legendData)
         .enter()
         .append("text")
         .attr("class", "legendText")
         .attr("x", margin.left + width + legendPadding + 30)
         .attr("y", function(d,i){
           return margin.top + 13 + 10*i + legendPadding
         })
         .attr("font-size", "10px")
         .attr("fill", function(d){
           return d.color;
         })
         .text(function(d){
           if (d.name == "All_Races"){
             return "All Races"
           }
           else{
             return d.name
           }

         })
     }

  // Function to update the plot
  function updatePlot(sex){

    updateAxes(sex);

    // update the title
    svg.select(".plot-title")
       .text("Scatter plot of the life expectancy and death rate in the USA for category: " + sex)

    // Transition the datapoints
    for (item in races){
      let t = d3.transition().duration(1000).ease(d3.easeQuadOut);
      let array = makeArray(dataset, sex, races[item]);
      let points = svg.selectAll("." + races[item])
                      .data(array);

      points.enter()
            .append("circle")
            .attr("r", 1.5)
            .attr("fill", colors[item])
            .attr("cy", height)
            .attr("cx", 0)
            .attr("class", races[item])
            .merge(points)
            .transition(t)
            .attr("cx", function(d){
              return xScale(d.lifeExpectancy) + margin.left
            })
            .attr("cy", function(d){
              return yScale(d.deathRate) + margin.top
            });
      points.exit().remove();

    }
  }

  // Function to update the axes
  function updateAxes(sex){

    // Calculate the maximum x- and y-value for the sex selected
    var maxX = d3.max(dataset, function(d){
      if (d.sex == sex){
        return parseInt(d.lifeExpectancy)
      }
    })
    var maxY = d3.max(dataset, function(d){
      if (d.sex == sex){
        return parseInt(d.deathRate)
      }
    })

    // Set the domain to the rounded up value of the maximum x- and y-value
    xScale.domain([0, Math.ceil(maxX/10)*10])
    yScale.domain([0,Math.ceil(maxY/500)*500])

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    // Transition the axes
    svg.select(".x-axis")
       .transition()
       .duration(1000)
       .ease(d3.easeQuadOut)
       .call(xAxis)

    svg.select(".y-axis")
       .transition()
       .duration(1000)
       .ease(d3.easeQuadOut)
       .call(yAxis)
  }

}

// Function to transform the API response
function transformResponse(data){

  let dataArray = [];
  let dataHere = data.data;

  // Add datapoints to dataArray
  for (i in dataHere){
    let datapoint = dataHere[i];
    let object = {year:datapoint[8], race:datapoint[9], sex:datapoint[10], lifeExpectancy:datapoint[11], deathRate:datapoint[12]};
    if (object.race == "All Races"){
      object.race = "All_Races";
    }
    dataArray.push(object);
  }
  return dataArray;
}

// Function to make an array of certain data
function makeArray(dataset, sex, race){
  dataList = [];
  for (object in dataset){
    if (dataset[object].sex == sex && dataset[object].race == race){
      dataList.push(dataset[object])
    }
  }
  return dataList;
}

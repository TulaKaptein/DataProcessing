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
  var margin = {left:40, right:20, top: 20, bottom: 20};
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

  maxX = d3.max(dataset, function(d){
    return parseInt(d.lifeExpectancy);
  })
  maxY = d3.max(dataset, function(d){
    return parseInt(d.deathRate);
  })
  console.log(maxX)
  console.log(maxY)

  xScale.domain([0,maxX]);
  yScale.domain([0,maxY]);

  // Make x and y axis
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
     .call(yAxis);

  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
     .call(xAxis);

  svg.append("text")
     .attr("x", 0.75*width)
     .attr("y", height + 10)
     .attr("class", "axis-title")
     .text("Average life expectancy (years)");

  svg.append("text")
     .attr("transform", "rotate(-90)")
     .attr("x", -230)
     .attr("y", 60)
     .attr("class", "axis-title")
     .text("Age adjusted death rate (per 100.000)");

 legend = svg.append("rect")
             .attr("class", "legend")
             .attr("x", width - 100)
             .attr("y", margin.top)
             .attr("width", 100)
             .attr("height", 40);

  var races = ["All Races", "Black", "White"];
  var sexes = ["Both Sexes", "Female", "Male"];
  var colors = ['rgb(27,158,119)','rgb(217,95,2)','rgb(117,112,179)'];
  var legendData = [];

  var points = makeScatter("Both Sexes")

  d3.select("#menu")
    .selectAll("button")
    .data(sexes)
    .enter()
    .append("button")
    .text(function(d){
      return d;
    })
    .on('click', function(d){
      updatePlot(d);
      return console.log("Whoop");
    })

    // function updatePlot(sex){
    //   for (item in races){
    //     let array = makeArray(dataset, sex, races[item]);
    //     svg.selectAll(races[item])
    //        .data(array)
    //        .transition()
    //        .duration(1000)
    //        .ease(d3.easeQuadOut)
    //        // .attr("fill", color[item])
    //        .attr("r", 1.5)
    //        .attr("cx", function(d){
    //          return xScale(d.lifeExpectancy) + margin.left
    //        })
    //        .attr("cy", function(d){
    //          return yScale(d.deathRate) + margin.top
    //        })
    //
    //   }
    // }

  function updatePlot(sex){
    for (item in races){
      let t = d3.transition().duration(1000).ease(d3.easeQuadOut);
      let array = makeArray(dataset, sex, races[item]);
      var points = svg.selectAll("." + races[item])
                      .data(array);
      console.log(points)
      // console.log(sex, races[item])
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
            })
    }
  }

  function makeScatter(sex){
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
      legendItem = {name:races[item], color:colors[item]};
      legendData.push(legendItem);
    }
    makeLegend(legendData);
    return points
  }

  function makeLegend(legendData){
    svg.selectAll("legendPoint")
       .data(legendData)
       .enter()
       .append("circle")
       .attr("class", "legendPoint")
       .attr("fill", function(d){
         return d.color
       })
       .attr("cx", width - 90)
       .attr("cy", function(d, i){
         return margin.top + 10 + 10*i
       })
       .attr("r", 3)
    svg.selectAll("legendText")
       .data(legendData)
       .enter()
       .append("text")
       .attr("class", "legendText")
       .attr("x", width - 70)
       .attr("y", function(d,i){
         return margin.top + 13 + 10*i
       })
       .attr("font-size", "10px")
       .text(function(d){
         return d.name
       })
   }
}

function transformResponse(data){
  let dataArray = [];
  let dataHere = data.data;
  for (i in dataHere){
    let datapoint = dataHere[i];
    let object = {year:datapoint[8], race:datapoint[9], sex:datapoint[10], lifeExpectancy:datapoint[11], deathRate:datapoint[12]};
    dataArray.push(object);
  }
  return dataArray;
}

function makeArray(dataset, sex, race){
  dataList = [];
  for (object in dataset){
    if (dataset[object].sex == sex && dataset[object].race == race){
      dataList.push(dataset[object])
    }
  }
  return dataList;
}

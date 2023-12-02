// Define the URL for the JSON file
const jsonUrl = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";


//Functions
function optionChanged(selectedValue) {
  // Perform actions based on the selected value
  console.log("Selected OTU ID:", selectedValue);
}

function initiateDropdown(){
  d3.json(jsonUrl)
  .then(function(data) {
      // Container and dropdown selection
     const container = d3.select("#well");
     const dropdown = d3.select("#selDataset");

     // Create options for the dropdown
     const options = dropdown
     .selectAll("option")
     .data(data.names)
     .enter()
     .append("option")
     .attr("value", d => d)
     .text(d => d);

    // Assign the value of the dropdown menu option to a variable
    let dataset = dropdown.property("value");

    loadData()
  })
  .catch(error => console.error("Error loading data:", error));
}

function loadData(){
// Use D3 to fetch the JSON data
d3.json(jsonUrl)
  .then(function(data) {

     // Dropdown selection
     const dropdown = d3.select("#selDataset");

    // Assign the value of the dropdown menu option to a variable
    let dataset = dropdown.property("value");

    //Demographic
    let metaData=data.metadata.find(x=>x.id.toString()===dataset);// Access the 'metadata' property
  
    // Get the sample-metadata element
    const metadataElement = document.getElementById('sample-metadata');

    // Clear previous content
    metadataElement.innerHTML = '';

    // Update the HTML content with demographic information
    for (const key in metaData) {
      const value = metaData[key];
      const pElement = document.createElement('p');
      pElement.textContent = `${key}: ${value}`;
      metadataElement.appendChild(pElement);
    }

    // Use the data for further processing
    let samples = data.samples.find(x=>x.id===dataset); // Access the 'samples' property

    // Create an array of objects with otu_id and sample_value properties
    let pairedSample = samples.otu_ids.map((otu_ids,index)=>({
      otu_ids:'OTU ' + otu_ids,
      sample_values:samples.sample_values[index]
    }));


    //Sort sample_values and get the top 10
    let topTen = pairedSample.sort((a, b) => a.sample_values - b.sample_values).slice(-10)
    let trace = {
      y:topTen.map(x=>x.otu_ids),
      x:topTen.map(x=>x.sample_values),
      type:'bar',
      orientation:'h'
    };
    Plotly.newPlot('plot',[trace],{displayModeBar : false});

    // Set up the bubble chart
    let bubbleTrace={
      x:samples.otu_ids,
      y:samples.sample_values,
      mode:'markers',
      marker: {
        size: samples.sample_values,  // Use sample_values for marker size
        color: samples.otu_ids,       // Use otu_ids for marker colors
        colorscale: 'Jet',        // Colorscale
        opacity: 0.7
      },
      text: samples.otu_labels 
    }
    
    var layout = {
      showlegend: false,
      height: 500,
      width: 1200,
      xaxis: {
        title: 'OTU ID'  // Updated x-axis label
      }
    };

    if(samples.otu_ids.length > 1){
      Plotly.newPlot('bubble', [bubbleTrace], layout);
    } else {
      const bubbleElement = document.getElementById('bubble');
      bubbleElement.innerHTML = 
      '<p style="font-weight: bold; font-size: 20px; text-align: center;">Not enough data to create a bubble chart!!!</p>';
    };
    
    // Set up the gauge chart
    const gradientColors = [
      "rgb(144,238,144)",
      "rgb(107,209,107)",
      "rgb(60,179,60)",
      "rgb(0,128,0)",
      "rgb(0,100,0)",
      "rgb(0,80,0)",
      "rgb(0,60,0)",
      "rgb(0,40,0)",
      "rgb(0,20,0)"  // Dark green
    ];
    
    // Create steps for the gauge chart with the gradient
    let gaugeSteps = [];
    for (let i = 1; i <= 9; i++) {
      gaugeSteps.push({
        range: [i - 1, i],
        color: gradientColors[i - 1],
        label: i + '-' + (i + 1) 
      });
    }

    let gaugeTrace={
      value: metaData.wfreq,
		  title: { text: "<b style='font-size: 30px;'>Belly Button Washing Frequency</b><br>Scrubs per Week",
      font: { size: 20, color: "black" }},
		  type: "indicator",
		  mode: "gauge+number",
      gauge: {
        axis: { range: [0, 9], tickwidth: 1, tickcolor: "darkblue" },
        bar: { color: "darkblue" },
        bgcolor: "white",
        steps: gaugeSteps,
        threshold: {
          line: { color: "red", width: 4 },
          thickness: 0.75,
          value: metaData.wfreq
        }}
      }

    var layout = { 
      width: 600, 
      height: 500, 
      margin: { t: 0, b: 0 },
     };
    Plotly.newPlot('gauge', [gaugeTrace], layout);

  })
  .catch(error => console.error("Error loading data:", error));

}

initiateDropdown()
// Call updatePlotly() when a change takes place to the DOM
d3.selectAll("#selDataset").on("change", loadData);
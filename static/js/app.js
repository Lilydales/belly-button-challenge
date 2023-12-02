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
    // Handle the data here
    console.log(data);

     // Dropdown selection
     const dropdown = d3.select("#selDataset");

    // Assign the value of the dropdown menu option to a variable
    let dataset = dropdown.property("value");

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
console.log(topTen)

    // Set up the bubble chart dimensions
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
      height: 400,
      width: 1200,
      xaxis: {
        title: 'OTU ID'  // Updated x-axis label
      }
    };

    Plotly.newPlot('bubble', [bubbleTrace], layout);
  })
  .catch(error => console.error("Error loading data:", error));

}

initiateDropdown()
// Call updatePlotly() when a change takes place to the DOM
d3.selectAll("#selDataset").on("change", loadData);
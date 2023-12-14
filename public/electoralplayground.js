// electoralexplanation.js
let ElectorPlaygroundMap;
let ElectorPlaygroundData;

const initDemTotal = 303;
const initRepTotal = 235;

let demTotal = 303;
let repTotal = 235;

const darkRed = "rgb(139, 0, 0)"; // Equivalent to #8B0000 in hex
const darkBlue = "rgb(0, 0, 139)"; // Equivalent to #00008B in hex
// Define light red and light blue colors
const lightRed = "rgb(255, 182, 193)"; // Light red color
const lightBlue = "rgb(173, 216, 230)"; // Light blue color

async function loadElectoralData() {
    try {
        const data = await d3.csv('electoralinfo.csv');
        return data;
    } catch (error) {
        console.error('Error loading electoralinfo.csv', error);
    }
}

async function initPlayground() {
    let electoralDemo = await loadElectoralData();
    const usData = await drawMap.getUSData(); // get usData
    let map = drawPlaygroundStateMap(usData);
    map = labelPlaygroundMap(map, electoralDemo, "electors");

    document.getElementById('electoralplayground').appendChild(map);

    // Assign the SVG to the global variable
    ElectorPlaygroundMap = map;
    ElectorPlaygroundData = electoralDemo;
}


function drawPlaygroundStateMap(usData) {
    const stateData = drawMap.getStateData(usData); // getStateData
    const statesFeatureCollection = {
        type: 'FeatureCollection',
        features: stateData,
    };

    const projection = d3.geoIdentity().fitSize([width, height], statesFeatureCollection);

    const svg1 = drawMap.createSVG(width, height);
    const stateMap = drawMap.drawStates(svg1, projection, stateData);

    return stateMap;
}

function labelPlaygroundMap(map, electoralData, labelType) {    
    // Assuming each state's path in the SVG has the class 'state'
    const tooltip = d3.select("#tooltip");
    
    d3.select(map).selectAll('.state')
        .each(function(d) {
            const stateName = d.properties.name; // Get the state name from the SVG
            const stateElectoralData = electoralData.find(data => data.state === stateName);
            // Find the corresponding electoral data for the state

            if (stateElectoralData) {
                let printtype = parseInt(stateElectoralData.electors, 10);

                // Set the color of the state based on the party2020 field
                let stateColor = stateElectoralData.party2020 === "red" ? darkRed : darkBlue;
                let circleColor = stateElectoralData.party2020 === "red" ? lightRed : lightBlue;

                d3.select(this)
                    .style("fill", stateColor)
                    .style("cursor", "pointer")  // Change cursor on hover
                    .on("click", function() {
                        // Get the current color in RGB format
                        let currentColor = d3.select(this).style("fill");
                        // Toggle the color
                        let newColor = currentColor === darkRed ? darkBlue : darkRed;
                        d3.select(this).style("fill", newColor);
                        // if the previous color was darkred, detract from rep total and add to dem
                        
                        if(currentColor === darkRed){
                            repTotal -= printtype;
                            demTotal += printtype;
                        }
                        // otherwise, do the opposite
                        if(currentColor === darkBlue){
                            repTotal += printtype;
                            demTotal -= printtype;
                        }
                        console.log("calling elecbar");
                        updateElecBar(demTotal, repTotal);
                        console.log("New party totals: " + demTotal + " for dems, " + repTotal + " for reps");
                });


                // Calculate the centroid of the state path for positioning the label
                const centroid = d3.geoPath().centroid(d);
                // Calculate the offset depending on the state
                offsets = calculateOffset(stateName);

                let xPos = centroid[0] + offsets[0];
                let yPos = centroid[1] + offsets[1];

                // Append a small white circle behind the label
                d3.select(this.parentNode) // Append to the parent of the path
                    .append("circle")
                    .attr("cx", xPos)
                    .attr("cy", yPos)
                    .attr("r", 10) 
                    .attr("fill", circleColor)
                    .on("mouseover", function(event) {
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltip.html(stateName) // Set the tooltip text to state name
                            .style("left", (event.pageX) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mouseout", function() {
                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });

                // Append a text element as a label
                d3.select(this.parentNode) // Append the label to the parent of the path
                    .append("text")
                    .attr("x", xPos)
                    .attr("y", yPos)
                    .attr("text-anchor", "middle")
                    .attr("alignment-baseline", "middle")
                    .attr("font-size", "14px") // Adjust the font size as needed
                    .style("font-weight", "bold") // Make the text bold
                    .style("fill", "black") // Set font color to light gray
                    .style("user-select", "none") // Prevent text selection
                    .text(printtype) // Display the number of electors
                    .on("mouseover", function(event) {
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltip.html(stateName) // Set the tooltip text to state name
                            .style("left", (event.pageX) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mouseout", function() {
                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });
            }
        });

    return map;
}

document.getElementById("allDemButton").addEventListener("click", function() {
    // set all states to blue
    d3.select(ElectorPlaygroundMap).selectAll('.state')
        .style("fill", darkBlue);
    demTotal = 538;
    repTotal = 0;
 });
 
 document.getElementById("playgroundResetButton").addEventListener("click", function() {
    // reset states to original colors
    demTotal = initDemTotal;
    repTotal = initRepTotal;

    d3.select(ElectorPlaygroundMap).selectAll('.state')
        .each(function(d) {
            const stateName = d.properties.name; // Get the state name from the SVG
            const stateElectoralData = ElectorPlaygroundData.find(data => data.state === stateName);
            // Find the corresponding electoral data for the state
            if (stateElectoralData) {
                // Set the color of the state based on the party2020 field
                let stateColor = stateElectoralData.party2020 === "red" ? darkRed : darkBlue;
                d3.select(this)
                    .style("fill", stateColor);
            }
        });
 });
 
 document.getElementById("allRepButton").addEventListener("click", function() {
    // set all states to red
    d3.select(ElectorPlaygroundMap).selectAll('.state')
        .style("fill", darkRed);
    demTotal = 0;
    repTotal = 538;
 });

function calculateOffset(stateName){
    let xOffset = 0;
    let yOffset = 0;
    
    if(stateName === "Vermont" ||
        stateName === "Connecticut" ||
        stateName === "Maryland" ||
        stateName === "West Virginia" ||
        stateName === "New Hampshire"                    
    ){
        xOffset = 20; 
    }else if(stateName === "Mississippi" ||
        stateName === "Alabama" ||
        stateName === "Arkansas" ||
        stateName === "Louisiana" ||
        stateName === "Minnesota" ||
        stateName === "Rhode Island" ||
        stateName === "Wisconsin"
    ){
        xOffset = 30;
    }else if(stateName === "Mississippi" ||
        stateName === "Alabama" ||
        stateName === "Arkansas" ||
        stateName === "Louisiana" ||
        stateName === "Minnesota" ||
        stateName === "Indiana" ||
        stateName === "Illinois" ||
        stateName === "Oklahoma" ||
        stateName === "Missouri" ||
        stateName === "Virginia" ||
        stateName === "Pennsylvania" ||
        stateName === "Kentucky" ||
        stateName === "Wisconsin"
    ){
        xOffset = 30;
    }else if(
        stateName === "Iowa" ||
        stateName === "Tennessee" ||
        stateName === "North Carolina" ||
        stateName === "South Carolina" ||
        stateName === "Georgia" ||
        stateName === "New York" ||
        stateName === "Massachusetts" ||
        stateName === "Maine" ||
        stateName === "Ohio"
    ){
        xOffset = 20;
    }
    else if(stateName === "Alaska"
    ){
        yOffset = -20;
        xOffset = 50;
    }
    else if(stateName === "Hawaii"
    ){
        xOffset = 60;
    }
    else if(stateName === "Idaho"
        || stateName === "Michigan"
    ){
        yOffset = 20;
        xOffset = 40;
    }
    else if (stateName === "New Jersey"){
        xOffset = 20;
        yOffset = -10;
    }
    else if(stateName === "Delaware"){
        xOffset = 40;
    }
    else{
        xOffset = 50;
    }

    return [xOffset, yOffset];
}


initPlayground();
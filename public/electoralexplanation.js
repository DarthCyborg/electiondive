// electoralexplanation.js
let globalElectorMap;
let globalElectorData;

async function loadElectoralData() {
    try {
        const data = await d3.csv('electoralinfo.csv');
        return data;
    } catch (error) {
        console.error('Error loading electoralinfo.csv', error);
    }
}

async function initExplanation() {
    let electoralDemo = await loadElectoralData();
    const usData = await drawMap.getUSData(); // get usData
    let map = drawExplanationStateMap(usData);
    map = labelExplanationMap(map, electoralDemo, "electors");

    document.getElementById('electoralmap').appendChild(map);

    // Assign the SVG to the global variable
    globalElectorMap = map;
    globalElectorData = electoralDemo;
}

function drawExplanationStateMap(usData) {
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

function labelExplanationMap(map, electoralData, labelType) {
    // Calculate min and max printtype values
    const printtypeValues = electoralData.map(d => {
        let value;
        if (labelType === "population") value = +d.popround;
        else if (labelType === "elecdivpop") value = +d.elecpopround;
        else value = +d.electors;

        return isNaN(value) ? 0 : value; // Convert to number and handle NaN
    });
    //console.log("printtypevalues for " + labelType);
    //console.log(printtypeValues);

    const minPrinttype = d3.min(printtypeValues);
    const maxPrinttype = d3.max(printtypeValues);

    //console.log("min and max for " + labelType);
    //console.log("min: " + minPrinttype);
    //console.log("max: " + maxPrinttype);

    // Create a color scale
    const colorScale = d3.scaleLinear()
                         .domain([minPrinttype, maxPrinttype])
                         .range(["lightgray", "rgb(47, 57, 101)"]);
    
    const threshold = (1 * ((maxPrinttype - minPrinttype) / 2)) + minPrinttype;
    
    // Assuming each state's path in the SVG has the class 'state'
    const tooltip = d3.select("#tooltip");
    
    d3.select(map).selectAll('.state')
        .each(function(d) {
            const stateName = d.properties.name; // Get the state name from the SVG
            const stateElectoralData = electoralData.find(data => data.state === stateName);
            // Find the corresponding electoral data for the state

            if (stateElectoralData) {
                let printtype = stateElectoralData.electors;
                if (labelType === "population"){
                    printtype = stateElectoralData.popround;
                }else if(labelType === "elecdivpop"){
                    printtype = stateElectoralData.elecpopround;
                }

                // Calculate the centroid of the state path for positioning the label
                const centroid = d3.geoPath().centroid(d);
                // Calculate the offset depending on the state
                offsets = calculateOffset(stateName);

                let xPos = centroid[0] + offsets[0];
                let yPos = centroid[1] + offsets[1];

                let radius = printtype;

                if(labelType === "elecdivpop"){
                    radius *= 10;
                    if(stateName === "New York"){
                        xPos -= 10;
                    }
                    if(stateName === "Rhode Island"){
                        xPos += 20;
                        yPos += 20
                    }
                    if(stateName === "Vermont"){
                        yPos -= 20;
                        xPos -= 20;
                    }
                    if(stateName === "Connecticut"){
                        xPos -= 20;
                    }
                    if(stateName === "Maine"){
                        xPos += 10;
                        yPos -= 20;
                    }
                    if(stateName === "New Hampshire"){
                        xPos += 20;
                    }
                    if(stateName === "District of Columbia"){
                        xPos += 70;
                    }
                }

                let circlecolor = colorScale(printtype);

                let textColor;
                if (printtype > threshold) {
                    textColor = "white";
                } else {
                    textColor = "black";
                }

                // Append a small white circle behind the label
                d3.select(this.parentNode) // Append to the parent of the path
                    .append("circle")
                    .attr("cx", xPos)
                    .attr("cy", yPos)
                    .attr("r", 10) 
                    .attr("fill", "white")
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


                // Append a light gray circle behind the label
                var circle = d3.select(this.parentNode) // Append to the parent of the path
                    .append("circle")
                    .attr("cx", xPos)
                    .attr("cy", yPos)
                    .attr("r", 0) // Start with radius 0
                    .attr("fill", circlecolor);

                // Attach event handlers directly to the circle
                circle.on("mouseover", function(event) {
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

                // Start the transition to grow the circle
                circle.transition() 
                .duration(1000) // Duration in milliseconds, adjust as needed
                .attr("r", radius); // Final radius of the circle

                // Append a text element as a label
                d3.select(this.parentNode) // Append the label to the parent of the path
                    .append("text")
                    .attr("x", xPos)
                    .attr("y", yPos)
                    .attr("text-anchor", "middle")
                    .attr("alignment-baseline", "middle")
                    .attr("font-size", "14px") // Adjust the font size as needed
                    .style("font-weight", "bold") // Make the text bold
                    .style("fill", textColor) // Set font color to light gray
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

function updateExplanationMapLabels(map, electoralData, labelType) {
    // Remove existing labels and circles
    d3.select(map).selectAll("text").remove();
    d3.select(map).selectAll("circle").remove();

    // Reapply the labelMap logic with the new labelType
    console.log("updating labels with: " + labelType);
    labelExplanationMap(map, electoralData, labelType);
}



document.getElementById("electorsButton").addEventListener("click", function() {
    //update map labels with electors
    updateExplanationMapLabels(globalElectorMap, globalElectorData, "electors");
    setElectorMapDisplay("Map of State Electors");
});

document.getElementById("populationButton").addEventListener("click", function() {
    //update map labels with population
    updateExplanationMapLabels(globalElectorMap, globalElectorData, "population");
    setElectorMapDisplay("Map of Population (Millions)");
});

document.getElementById("ratioButton").addEventListener("click", function() {
    //update map labels with ratio
    updateExplanationMapLabels(globalElectorMap, globalElectorData, "elecdivpop");
    setElectorMapDisplay("Map of Electors per Million People");
});

function setElectorMapDisplay(state) {
    document.getElementById("electorsDisplay").innerText = "Displaying: " + state;
}

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


initExplanation();
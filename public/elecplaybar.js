// Dimensions for the SVG container
const elecbarwidth = 500; // Width of the SVG
const elecbarheight = 40; // Height of the SVG

function renderProportionalRectangle(dem, rep) {
    const total = dem + rep;
    const demProportion = dem / total;

    // Create SVG container
    const svg = d3.select("#elecplaybar").append("svg")
                  .attr("width", elecbarwidth)
                  .attr("height", elecbarheight);


   // Append the red rectangle for Republicans
   svg.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", elecbarwidth)
      .attr("height", elecbarheight)
      .attr("class", "rep-rect")
      .attr("fill", "darkred");

    // Append the blue rectangle for Democrats
    // rendered on top of red
    svg.append("rect")
       .attr("x", 0)
       .attr("y", 0)
       .attr("width", elecbarwidth * demProportion)
       .attr("height", elecbarheight)
       .attr("class", "dem-rect")
       .attr("fill", "darkblue");

    // Append text for Democratic votes
    svg.append("text")
      .attr("x", 10) // Adjust as needed
      .attr("y", elecbarheight / 2)
      .attr("alignment-baseline", "middle")
      .attr("fill", "white")
      .attr("class", "dem-text")
      .text(dem + " - Joe Biden");

   // Append text for Republican votes
   svg.append("text")
      .attr("x", elecbarwidth - 10) // Adjust as needed
      .attr("y", elecbarheight / 2)
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .attr("fill", "white")
      .attr("class", "rep-text")
      .text("Donald Trump - " + rep);

   // Append a thin white bar in the middle
   svg.append("rect")
      .attr("x", elecbarwidth / 2 - 1) // Thin bar, adjust width as needed
      .attr("y", 0)
      .attr("width", 2) // Width of the bar
      .attr("height", elecbarheight)
      .attr("fill", "white");
    
}

renderProportionalRectangle(303, 235);

function updateElecBar(dem, rep){
   // transition size of blue rectangle as indicated by input params
   const total = dem + rep;
   const demProportion = dem / total;
   const newWidth = elecbarwidth * demProportion;

    // Select the SVG container
    const svg = d3.select("#elecplaybar").select("svg");

    // Select the blue rectangle and transition its width
    svg.select(".dem-rect")
       .transition()
       .duration(500)
       .attr("width", newWidth);

   // Update Democratic votes text
   svg.select(".dem-text")
      .text(dem + " - Joe Biden");

   // Update Republican votes text
   svg.select(".rep-text")
      .text("Donald Trump - " + rep);
}

document.getElementById("allDemButton").addEventListener("click", function() {
   updateElecBar(538, 0);
});

document.getElementById("playgroundResetButton").addEventListener("click", function() {
   updateElecBar(303, 235);
});

document.getElementById("allRepButton").addEventListener("click", function() {
   updateElecBar(0, 538);
});
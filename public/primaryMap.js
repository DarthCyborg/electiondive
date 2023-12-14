const height = 600;
const width = 960;

async function main() {
    let primaryResults = await primaryData.getPrimaryResults();
    const usData = await drawMap.getUSData(); // get usData
    let map = drawExplanationStateMap(usData);
    map = colorStateMap(map, primaryResults);

    document.getElementById('primary-map').appendChild(map);
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

function colorStateMap(map, primaryResults) {
    const candidateColorMap = new Map();
    candidateColorMap.set("Joe Biden", 'blue');
    candidateColorMap.set("Bernie Sanders", 'green');
    candidateColorMap.set("Pete Buttigieg", 'yellow');

    const winners = filterWinningCandidates(primaryResults);

    const tooltip = d3.select("#tooltip")
        .style("background", "rgba(0, 0, 0, 0.7)")
        .style("color", "white")
        .style("padding", "10px")
        .style("border", "1px solid gray")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("transition", "opacity 0.3s");

    function mousemove(event) {
        tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
    }


    d3.select(map).selectAll('.state')
        .style('fill', d => {
            // Find the winning candidate for the current state
            const stateName = d.properties.name;
            const winningCandidate = winners.find(winner => winner.contest === stateName);
            // If a winning candidate is found, use the candidateColorMap to fill the state
            return candidateColorMap.get(winningCandidate.candidate) || 'gray';
        })
        .on('mouseover', function (event, d) {
            const stateName = d.properties.name;
            const tooltipHtml = generateTooltipContent(stateName, primaryResults);
            tooltip.html(tooltipHtml)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px")
                .style("color", "white")
                .style('opacity', 1)
                .classed('hidden', false);
        })
        .on("mousemove", event => mousemove(event))
        .on('mouseout', function () {
            tooltip.style('opacity', 0)
                .classed('hidden', true);
        });

    return map;
}

function filterWinningCandidates(data) {
    const contestCandidates = {};

    for (const row of data) {
        const contest = row['Contest'];
        const candidate = row['Candidate'];
        const delegates = parseInt(row['Delegates'], 10);

        // Check if the candidate is not "Total"
        if (candidate !== "Total") {
            if (!contestCandidates[contest] || delegates > contestCandidates[contest].delegates) {
                contestCandidates[contest] = { candidate, delegates };
            }
        }
    }

    // Convert the contestCandidates object to an array
    const result = Object.entries(contestCandidates).map(([contest, data]) => ({
        contest,
        candidate: data.candidate,
        delegates: data.delegates,
    }));

    return result;
}

function generateTooltipContent(stateName, primaryResults) {
    // Filter out results where the Candidate name is "Total" and match the state name
    const stateResults = primaryResults.filter(result => result.Candidate !== "Total" &&
        result.Candidate !== "Inactive votes" && result.Candidate !== "Write-in votes" &&
        result.Candidate !== "No Preference" && result.Contest === stateName);

    // Sort the filtered results by delegates in descending order
    stateResults.sort((a, b) => b.Delegates - a.Delegates);

    let tooltipHtml = `<strong>${stateName}</strong><br/>`;
    stateResults.slice(0, 5).forEach(result => {
        const delegates = result.Delegates ? result.Delegates : '0';
        tooltipHtml += `${result.Candidate} - ${delegates} Delegates, ${result.Percent}% votes<br/>`;
    });

    return tooltipHtml;
}

console.log("primaryMap started...");
main();
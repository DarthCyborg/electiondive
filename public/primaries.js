async function main() {
    try {
        let withdrawMapping = await getWithdrawMapping();
        let primaryResults = await primaryData.getPrimaryResults();
        let primaryDescriptions = await getPrimaryDescriptions();

        initBarGraph();
        updateBarGraph(0, primaryResults);
        candidateImages(withdrawMapping);
        createTimeline(withdrawMapping, primaryResults, primaryDescriptions);

    } catch (error) {
        console.error("Error reading mainCandidateInfo", error);
    }
}

function candidateImages(withdrawMapping) {
    const width = 600, height = 412;

    const svg = d3.select("#candidate-images").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("border", "1px solid gray")
        .style("border-radius", "10px");


    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("text-align", "center")
        .style("width", "120px")
        .style("padding", "8px")
        .style("font", "14px sans-serif")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("border", "1px solid gray")
        .style("border-radius", "10px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    function getCandidate(id) {
        return withdrawMapping[id - 1];
    }

    // Functions to handle mouse events
    function mouseover(event, id) {
        const candidate = getCandidate(id);
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(candidate.Name)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
    }

    function mousemove(event) {
        tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
    }

    function mouseout() {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    }

    function click(event, id) {
        const candidate = getCandidate(id);
        window.open(candidate.link);
    }

    d3.range(1, 6).forEach((i, index) => {
        svg.append("image")
            .attr("xlink:href", `animation_images/${i}.jpg`)
            .attr("x", 146 + ((index * 60) + (index * 2)))
            .attr("y", 2)
            .attr("width", 60)
            .attr("height", 80)
            .attr("id", `candidate-${i}`)
            .style("cursor", "pointer")
            .on("mouseover", event => mouseover(event, i))
            .on("mousemove", event => mousemove(event))
            .on("mouseout", mouseout)
            .on("click", event => click(event, i));
    });

    d3.range(6, 12).forEach((i, index) => {
        svg.append("image")
            .attr("xlink:href", `animation_images/${i}.jpg`)
            .attr("x", 115 + ((index * 60) + (index * 2)))
            .attr("y", 84)
            .attr("width", 60)
            .attr("height", 80)
            .attr("id", `candidate-${i}`)
            .style("cursor", "pointer")
            .on("mouseover", event => mouseover(event, i))
            .on("mousemove", event => mousemove(event))
            .on("mouseout", mouseout)
            .on("click", event => click(event, i));
    });

    d3.range(12, 19).forEach((i, index) => {
        svg.append("image")
            .attr("xlink:href", `animation_images/${i}.jpg`)
            .attr("x", 84 + ((index * 60) + (index * 2)))
            .attr("y", 166)
            .attr("width", 60)
            .attr("height", 80)
            .attr("id", `candidate-${i}`)
            .style("cursor", "pointer")
            .on("mouseover", event => mouseover(event, i))
            .on("mousemove", event => mousemove(event))
            .on("mouseout", mouseout)
            .on("click", event => click(event, i));
    });

    d3.range(19, 25).forEach((i, index) => {
        svg.append("image")
            .attr("xlink:href", `animation_images/${i}.jpg`)
            .attr("x", 115 + ((index * 60) + (index * 2)))
            .attr("y", 248)
            .attr("width", 60)
            .attr("height", 80)
            .attr("id", `candidate-${i}`)
            .style("cursor", "pointer")
            .on("mouseover", event => mouseover(event, i))
            .on("mousemove", event => mousemove(event))
            .on("mouseout", mouseout)
            .on("click", event => click(event, i));
    });

    d3.range(25, 30).forEach((i, index) => {
        svg.append("image")
            .attr("xlink:href", `animation_images/${i}.jpg`)
            .attr("x", 146 + ((index * 60) + (index * 2)))
            .attr("y", 330)
            .attr("width", 60)
            .attr("height", 80)
            .attr("id", `candidate-${i}`)
            .style("cursor", "pointer")
            .on("mouseover", event => mouseover(event, i))
            .on("mousemove", event => mousemove(event))
            .on("mouseout", mouseout)
            .on("click", event => click(event, i));
    });
}

function createTimeline(withdrawMapping, primaryResults, primaryDescriptions) {
    const margin = { top: 0, right: 50, bottom: 0, left: 50 };
    const width = window.innerWidth*0.8 - margin.left - margin.right; // Dynamic width calculation
    const height = 100;

    const svg = d3.select("#primary-timeline").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + height / 2 + ")");

    const x = d3.scaleLinear()
        .domain([0, 25])
        .range([0, width])
        .clamp(true);

    svg.append("line")
        .attr("class", "slider-track")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
        .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "slider-track-inset");

    svg.selectAll(".slider-tick")
        .data(x.ticks(25)) // This creates 26 ticks (0 to 25)
        .enter().append("circle")
        .attr("class", "slider-tick")
        .attr("cx", x)
        .attr("cy", 0)
        .attr("r", 6)
        .style("fill", "gray");

    const handle = svg.append("circle")
        .attr("class", "handle")
        .attr("r", 15)
        .attr("cx", x(0))
        .attr("cy", 0)
        .style("opacity", "0.8");

    handle.call(d3.drag()
        .on("start drag", function (event) {
            const xValue = Math.round(x.invert(event.x));
            handle.attr("cx", x(xValue));
            updateCandidateImageOpacity(xValue, withdrawMapping);
            displayEventDetails(xValue, primaryResults, primaryDescriptions);
            updateBarGraph(xValue, primaryResults);
        }));

    const leftDiv = document.getElementById("left-container");
    leftDiv.innerHTML = ''; // Clear existing content
    const initial = document.createElement('p');
    const initialVal = primaryDescriptions.filter(d => parseInt(d.Date_id) === 0);
    initial.textContent = `${initialVal[0].Description}`;
    initial.style.float = 'left';
    leftDiv.appendChild(initial);

    const rightDiv = document.getElementById("right-container");
    rightDiv.innerHTML = '';
    const val = document.createElement('p');
    val.innerHTML = `Results: <br><br>`;
    val.style.textAlign = 'center';
    rightDiv.appendChild(val);
}

function updateCandidateImageOpacity(currentTick, withdrawMapping) {
    withdrawMapping.forEach(candidate => {
        // Select the image using the ID pattern established in candidateImages method
        const candidateImage = d3.select(`#candidate-${candidate.id}`);

        // Check if the candidate has withdrawn
        if (currentTick >= candidate.withdraw_date_id) {
            // If so, make the image more transparent
            candidateImage.style("opacity", 0.1);
        } else {
            // If not, make sure the image is fully opaque
            candidateImage.style("opacity", 1);
        }
    });
}

function displayEventDetails(dateId, primaryResults, primaryDescriptions) {
    const contestsOnDate = primaryResults.filter(result => parseInt(result.Date_id) === dateId);

    const groupedByContest = contestsOnDate.reduce((acc, result) => {
        acc[result.Contest] = acc[result.Contest] || [];
        acc[result.Contest].push(result);
        return acc;
    }, {});

    for (const contest in groupedByContest) {
        const candidates = groupedByContest[contest].filter(candidate => candidate.Candidate !== 'Total');
        candidates.sort((a, b) => parseInt(b.Delegates) - parseInt(a.Delegates));
        groupedByContest[contest] = candidates;
    }

    const leftDiv = document.getElementById("left-container");
    const rightDiv = document.getElementById("right-container");

    leftDiv.innerHTML = ''; // Clear existing content
    rightDiv.innerHTML = ''; // Clear existing content

    const val = document.createElement('p');
    val.innerHTML = `Results: <br><br>`;
    val.style.textAlign = 'center';
    rightDiv.appendChild(val);

    if (contestsOnDate.length > 0) {
        const datePara = document.createElement('p');
        datePara.textContent = `Date: ${contestsOnDate[0].Date}`;
        datePara.style.float = 'left';

        const contextPara = document.createElement('p');
        contextPara.innerHTML = `Context: ${contestsOnDate[0].Context} <br> <br>`;
        contextPara.style.float = 'left';

        leftDiv.appendChild(datePara);
        leftDiv.appendChild(contextPara);
    }

    const printVal = primaryDescriptions.filter(d => parseInt(d.Date_id) === dateId);
    const descriptionPara = document.createElement('p');
    console.log(printVal[0]);
    descriptionPara.textContent = `${printVal[0].Description}`;
    descriptionPara.style.float = 'left';
    leftDiv.appendChild(descriptionPara);

    for (const contest in groupedByContest) {
        const winners = groupedByContest[contest];
        if (winners.length > 0) {
            const contestPara = document.createElement('p');
            const candidateName = winners[0].Candidate;

            const candidateSpan = document.createElement('span');
            candidateSpan.textContent = candidateName;

            // Apply different styles based on the candidate's name
            if (candidateName === 'Joe Biden') {
                candidateSpan.style.color = 'blue';
            } else if (candidateName === 'Bernie Sanders') {
                candidateSpan.style.color = 'green';
            } else if (candidateName === 'Michael Bloomberg') {
                candidateSpan.style.color = 'purple';
            } else if (candidateName === 'Pete Buttigieg') {
                candidateSpan.style.color = 'yellow';
            }

            // Append the styled candidate's name to the paragraph
            contestPara.textContent = `${contest}: `;
            contestPara.appendChild(candidateSpan);

            // Append the paragraph to the rightDiv
            rightDiv.appendChild(contestPara);
        }
    }
}

function initBarGraph() {
    var svgWidth = 500, svgHeight = 412;
    var graphOffsetX = 100;
    var graphOffsetY = 20;

    var svg = d3.select("#candidate-tracker")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .style("border", "1px solid gray")
        .style("border-radius", "10px");

    // Group for the graph content, including bars and axes
    var graphGroup = svg.append("g")
        .attr("transform", "translate(" + graphOffsetX + "," + graphOffsetY + ")");

    // Create a group for the bars within the graph group
    graphGroup.append("g")
        .attr("class", "bars");

    // Create group for x-axis
    graphGroup.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + (svgHeight - graphOffsetY - 20) + ")")
        .attr("color", "white");

    // Create group for y-axis
    graphGroup.append("g")
        .attr("class", "y-axis")
        .attr("color", "white");

    // Add graph title
    svg.append("text")
        .attr("x", svgWidth / 2)
        .attr("y", graphOffsetY)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "16px")
        .text("Delegates Awarded - 1,991 to Win");
}

function updateBarGraph(dateId, primaryResults) {
    var delegateCounts = {};
    var activeCandidates = ["Joe Biden", "Bernie Sanders", "Elizabeth Warren", "Michael Bloomberg", "Pete Buttigieg"];
    var filteredCandidates = activeCandidates.concat(activeCandidates.map(name => name + " (withdrawn)"));

    primaryResults.forEach(function (row) {
        if (parseInt(row.Date_id) <= dateId && filteredCandidates.includes(row.Candidate)) {
            // Extract the base candidate name, irrespective of withdrawal status
            var baseCandidateName = row.Candidate.replace(" (withdrawn)", "");

            if (!delegateCounts[baseCandidateName]) {
                delegateCounts[baseCandidateName] = 0;
            }
            if (!isNaN(parseInt(row.Delegates))) {
                delegateCounts[baseCandidateName] += parseInt(row.Delegates);
            } else {
                delegateCounts[baseCandidateName] += 0;
            }
        }
    });

    var data = activeCandidates.map(candidate => ({
        candidate: candidate,
        delegates: delegateCounts[candidate] || 0
    }));

    var xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.delegates)])
        .range([0, 300]);

    var yScale = d3.scaleBand()
        .domain(activeCandidates)
        .range([0, 412 - 20 - 20])
        .padding(0.1);

    var svg = d3.select("#candidate-tracker svg");

    // Update x-axis
    svg.select(".x-axis")
        .call(d3.axisBottom(xScale).ticks(5));

    // Update y-axis and set text color
    svg.select(".y-axis")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .attr("fill", "white");

    // Bind data to bars
    var bars = svg.select(".bars")
        .selectAll("rect")
        .data(data, d => d.candidate);

    // Enter new bars
    bars.enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", d => yScale(d.candidate))
        .attr("width", d => xScale(d.delegates))
        .attr("height", yScale.bandwidth())
        .attr("fill", function (d) {
            // Assign colors based on candidate names
            switch (d.candidate) {
                case "Joe Biden":
                    return "blue";
                case "Bernie Sanders":
                    return "green";
                case "Elizabeth Warren":
                    return "red";
                case "Michael Bloomberg":
                    return "purple";
                case "Pete Buttigieg":
                    return "yellow";
                default:
                    return "steelblue";
            }
        });

    // Update existing bars
    bars.attr("width", d => xScale(d.delegates));

    // Remove old bars
    bars.exit().remove();

    // Add delegate count labels to bars
    var labels = svg.select(".bars")
        .selectAll("text.delegate-label")
        .data(data, d => d.candidate);

    labels.enter()
        .append("text")
        .attr("class", "delegate-label")
        .attr("x", d => xScale(d.delegates) + 3)
        .attr("y", d => yScale(d.candidate) + yScale.bandwidth() / 2)
        .attr("dy", ".35em")
        .attr("fill", "white")
        .text(d => d.delegates);

    // Update existing labels
    labels.attr("x", d => xScale(d.delegates) + 3)
        .text(d => d.delegates);

    // Remove old labels
    labels.exit().remove();
}

function getWithdrawMapping() {
    return new Promise((resolve, reject) => {
        d3.csv('primaryWithdrawMapping.csv', { encoding: 'utf-8' }, function (row) {
            return row;
        }).then(data => {
            console.log("CSV Loaded: ", data);
            resolve(data);
        }).catch(error => {
            console.error("Error loading the CSV file: ", error);
            reject(error);
        });
    });
}

function getPrimaryDescriptions() {
    return new Promise((resolve, reject) => {
        d3.csv('primaryDescriptions.csv', { encoding: 'utf-8' }, function (row) {
            return row;
        }).then(data => {
            console.log("CSV Loaded: ", data);
            resolve(data);
        }).catch(error => {
            console.error("Error loading the CSV file: ", error);
            reject(error);
        });
    });
}

console.log("primaries started...");
main();
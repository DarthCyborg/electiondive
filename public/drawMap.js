var drawMap = {
    // Function to get US shape data - must use an async function and the "await" keyword!
    async getUSData() {
        try {
            const usData = await d3.json('https://d3js.org/us-10m.v2.json');
            return usData;
        } catch (error) {
            console.error('Error loading data', error);
        }
    },

    // Function to parse state shape data from US shape data
    getStateData(usData) {
        return topojson.feature(usData, usData.objects.states).features;
    },

    // Function to parse county shape data from US shape data
    getCountyData(usData) {
        return topojson.feature(usData, usData.objects.counties).features;
    },

    // Creates and returns a formatted svg container
    createSVG(width, height) {
        const svg = d3.create("svg")
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .style('max-width', 'fill')
            .style('height', '100%');

        return svg.node();
    },

    // Returns a map of US States
    drawStates(svg, projection, stateData) {
        const path = d3.geoPath().projection(projection);

        d3.select(svg)
            .attr('class', 'states')
            .selectAll('path')
            .data(stateData)
            .join('path')
            .attr('class', 'state')
            .attr('d', path)
            .attr('id', 'state')
            .style('fill', 'white')
            .style('stroke', 'black');

        return svg;
    },

    // Returns a map of US Counties
    drawCounties(svg, projection, countyData) {
        const path = d3.geoPath().projection(projection);

        d3.select(svg)
            .attr('class', 'counties')
            .selectAll('path')
            .data(countyData)
            .join('path')
            .attr('class', 'county')
            .attr('d', path)
            .style('fill', 'white')
            .style('stroke', 'black');

        return svg;
    }
};
var primaryData = {
    getPrimaryResults() {
        return new Promise((resolve, reject) => {
            d3.csv('primaryResults.csv', function (row) {
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
};
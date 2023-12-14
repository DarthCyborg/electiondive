function main() {
    getPrimaryResults().then(data => {
        const primaryResults = data;
        console.log(primaryResults);

        let filteredResults = primaryResults.filter(function(row) {
            const candidate = row.Candidate;
            // List of strings to check for
            const stringsToExclude = ["withdrawn", "Uncommitted", "Blank", "Other", "Preference", "Inactive", "Write", "Republican"];
        
            // Check if the candidate's name includes any of the strings
            return !stringsToExclude.some(excludeString => candidate.includes(excludeString));
        });
        console.log(filteredResults);
        // For each primary/caucus, this contains the results of candidates that actively participated
        // (had not dropped out yet)
        // Format:
        // Candidate, Votes, Percent, Delegates, Contest, Date, Context
        // For each "Contest", we have all the candidates that participated and the number of votes they got
        // For each "Contest", we have a Candidate named "Total" which contains the total votes
        // The timeline can either be based around the "Date" field or the "Context" field, which is used to group sets of Dates
    
    }).catch(error => {
        console.error("Error loading primaryResults.csv", error);
    });
}

function getPrimaryResults() {
    return new Promise((resolve, reject) => {
        d3.csv('primaryResults.csv', function(row) {
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

console.log("main started...");
main();

// Withdrawn
// Uncommitted
// Blank
// Other
// Preference
// Inactive
// Write
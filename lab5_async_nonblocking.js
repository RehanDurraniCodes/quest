const fs = require("fs");

console.log("1. Starting Asynchronous File Read...");

fs.readFile("delay_data.txt", "utf8", function (err, data) {
    if (err) {
        console.log("Error reading file");
        return;
    }

    console.log("3. ASYNC Callback Fired. Data Read:");
    console.log("------------------------------------");
    console.log(data);
    console.log("------------------------------------");
});

console.log("2. Main Thread FREE. Non-blocking Code Executing.");

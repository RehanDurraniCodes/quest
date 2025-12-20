const fs = require("fs");


fs.writeFileSync("my_data.txt", "Synchronous Start");


let data1 = fs.readFileSync("my_data.txt", "utf8");
console.log("1. SYNCHRONOUS Read Complete:", data1);


fs.readFile("my_data.txt", "utf8", function (err, data2) {
    console.log("3. ASYNCHRONOUS Read Complete:", data2);
});

console.log("2. NON-BLOCKING operation in progress...");

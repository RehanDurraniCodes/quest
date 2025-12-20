
const os = require('os');

console.log("1. === System Identification ===");
console.log("Hostname:", os.hostname());
console.log("Platform:", os.platform());


const totalMemoryGB = (os.totalmem() / (1024 ** 3)).toFixed(2);
const freeMemoryGB = (os.freemem() / (1024 ** 3)).toFixed(2);
const usedMemoryGB = (totalMemoryGB - freeMemoryGB).toFixed(2);
const usedMemoryPercentage = ((usedMemoryGB / totalMemoryGB) * 100).toFixed(2);

console.log("\n2. === Memory Monitor ===");
console.log("Total Memory:", totalMemoryGB, "GB");
console.log("Free Memory:", freeMemoryGB, "GB");
console.log("Used Memory:", usedMemoryGB, "GB");
console.log("Memory Usage:", usedMemoryPercentage + "%");

console.log("\n3. === Hardware & Release Info ===");
console.log("CPU Architecture:", os.arch());
console.log("OS Release Version:", os.release());
console.log("CPU Model:", os.cpus()[0].model);

if (usedMemoryPercentage > 80) {
  console.log("\n SYSTEM OVERLOAD WARNING");
}

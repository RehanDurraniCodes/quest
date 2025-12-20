const os = require("os");

console.log("System Identity:");
console.log("OS Platform:", os.platform());
console.log("OS Name:", os.type());

console.log("\nCPU Details:");
console.log("CPU Architecture:", os.arch());
console.log("Logical Cores:", os.cpus().length);

console.log("\nHostname:");
console.log(os.hostname());

const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;

const usedMemMB = (usedMem / (1024 * 1024)).toFixed(2);

console.log("\nMemory Status:");
console.log("Used Memory:", usedMemMB, "MB");

const fs = require("fs");

fs.writeFile("chain_test.txt", "Start of Chain", function (err) {
    if (err) {
        console.log("ERROR at Step 1: File creation failed.");
        return;
    }

    fs.readFile("chain_test.txt", "utf8", function (err, data) {
        if (err) {
            console.log("ERROR at Step 2: File read failed.");
            return;
        }

        fs.unlink("chain_test.txt", function (err) {
            if (err) {
                console.log("ERROR at Step 3: File deletion failed.");
                return;
            }

            console.log("SUCCESS: Full asynchronous chain completed and cleaned up.");
        });
    });
});

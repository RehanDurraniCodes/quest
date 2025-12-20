const fs = require("fs");

fs.writeFile("profile.txt", "Name: Student\nAge: 20", function (err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log("A. Profile file created.");

    fs.appendFile("profile.txt", "\nStatus: Active", function (err) {
        if (err) {
            console.log(err);
            return;
        }
        console.log("B. Status updated.");

     
        fs.readFile("profile.txt", "utf8", function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            console.log("C. Read Complete. Content:\n" + data);

            // D. Delete file
            fs.unlink("profile.txt", function (err) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("D. Profile file deleted.");
            });
        });
    });
});

var fs = require('fs');

function convertFileToCSV(fname) {
    let logData = JSON.parse(fs.readFileSync(fname + ".json"));

    let startTime = logData[0].time;

    let output = "";

    logData.forEach( (data) => {
        let timeDiff = data.time - startTime;

        output += timeDiff 
        output += ",";
        output += data.averageOfSpeeds.replace(" km/h","");
        output += ",";
        output += data.carData[0].speed.replace(" km/h","");

        output += "\n";
    } );

    fs.writeFileSync(fname + ".csv", output);
}

convertFileToCSV('legacy_mode_data');
convertFileToCSV('colony_mode_data');
var fs = require('fs');

function readCSV(fname) {
    return JSON.parse(fs.readFileSync(fname + ".json"));
}

let legacyMode = readCSV('legacy_mode_data');
let colonyMode = readCSV('colony_mode_data');

let carCount = legacyMode[0].carData.length;

X_L_sum = 0;
X_C_sum = 0;

for (let i = 0; i < carCount; i++) {
    let legacy_at60 = legacyMode[60].carData[i];
    let legacy_at120 = legacyMode[120].carData[i];
    let colony_at60 = colonyMode[60].carData[i];
    let colony_at120 = colonyMode[120].carData[i];

    let X_L = (legacy_at120.odometer - legacy_at60.odometer);
    let V_L = 3.6 * X_L / 60;
    let X_C = (colony_at120.odometer - colony_at60.odometer);
    let V_C = 3.6 * X_C / 60;

    X_L_sum += X_L;
    X_C_sum += X_C;

    let a = X_C / X_L - 1;
    let b = V_C / V_L - 1;

    //console.log("car id = " + legacy_at60.id + " = " + colony_at60.id);
    //console.log("X_L = " + X_L.toFixed(0) + "m");
    //console.log("V_L = " + V_L.toFixed(0) + " km/h");
    //console.log("X_C = " + X_C.toFixed(0) + "m");
    //console.log("V_C = " + V_C.toFixed(0) + " km/h");
    //console.log("a = " + (a * 100).toFixed(0) + "% = b = " + (b * 100).toFixed(0) + "%");

    console.log(legacy_at60.id + " & " 
    + X_L.toFixed(0) + " m & "
    + V_L.toFixed(0) + " km/h & " 
    + X_C.toFixed(0) + " m & "
    + V_C.toFixed(0) + " km/h & "
    + (a *100).toFixed(0) + "% \\\\"
    
    );

}

let id = "Média";
let X_L = X_L_sum / carCount;
let V_L = 3.6 * X_L / 60;
let X_C = X_C_sum / carCount;
let V_C = 3.6 * X_C / 60;
let a = X_C / X_L - 1;
let b = V_C / V_L - 1;


console.log(id + " & " 
+ X_L.toFixed(0) + " m & "
+ V_L.toFixed(0) + " km/h & " 
+ X_C.toFixed(0) + " m & "
+ V_C.toFixed(0) + " km/h & "
+ (a *100).toFixed(0) + "% \\\\"

);
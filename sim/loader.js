class Simulation {
    constructor(id, cars, streets, cross) {
        this.id = id;
        this.cars = cars;
        this.streets = streets;
        this.cross = cross;
        this.elements = [].concat(this.cross).concat(this.streets).concat(this.cars);
        this.dataCollector = new DataCollector(this);
        this.dataCollector.start();
    }

    getElements() {
        return this.elements;
    }
}

class DataCollector {

    constructor(simulation) {
        this.simulation = simulation;
    }

    start(simulation) {
        this.thread = setInterval(async ()=>{
            this.collect();
        }, 1000);

        this.dataLog = [];
    }

    collect() {
        let collectedCount = this.dataLog.length;
        let time = getMillis();
        let carCount = 0;
        let averageOfSpeeds = 0;   // dm/s
        let averageOdometer = 0;  // meters
        let colonyMode = false;
        let carData = [];

        this.simulation.cars.forEach( (car) => {
            averageOfSpeeds += car.speed;
            averageOdometer += dm_m(car.odometer);
            carCount++;

            if (car.colonyMode) {
                colonyMode = true;
            }

            carData.push({
                id: car.id,
                time: time,
                speed: dms_kmh(car.speed).toFixed(2) + " km/h",
                odometer: dm_m(car.odometer),
                colonyMode: car.colonyMode,
            });
        } );

        averageOfSpeeds /= carCount;
        averageOdometer /= carCount;

        let averageSpeedOnLastMinute = null;

        if (collectedCount >= 60) {
            let lastMinuteInfo = this.dataLog[collectedCount-60];
            averageSpeedOnLastMinute = ms_kmh((averageOdometer - lastMinuteInfo.averageOdometer) / 60).toFixed(2) + " km/h"; 
        }

        let collectedData = {
            time: time,
            averageOfSpeeds: dms_kmh(averageOfSpeeds).toFixed(2) + " km/h",
            averageOdometer: averageOdometer,
            averageSpeedOnLastMinute: averageSpeedOnLastMinute,
            colonyMode: colonyMode,
            carData: carData
        };

        console.log(collectedData);
        this.dataLog.push(collectedData);
    }
}

async function loadSimulation() {

    let simulation_id = await generateRandomId();
    let mcenter = new AllignedPosition(0, 0, 0);

    let streetEast1 = new Street(
        mcenter.copy(),
        STREET_LENGTH, STREET_WIDTH,
        await generateSequentialId(),
    );

    let streetEast2 = new Street(
        streetEast1.getEnd().left(STREET_WIDTH * 1.5)
            .rotate(Math.PI),
        STREET_LENGTH, STREET_WIDTH,
        await generateSequentialId(),
    );

    let streetNorth1 = new Street(
        streetEast2.getEnd().forward(STREET_WIDTH * 1.5)
            .rotate(Math.PI / 2)
            .forward(STREET_WIDTH * 1.5),
        STREET_LENGTH, STREET_WIDTH,
        await generateSequentialId(),
    );

    let streetNorth2 = new Street(
        streetNorth1.getEnd().left(STREET_WIDTH * 1.5)
            .rotate(Math.PI),
        STREET_LENGTH, STREET_WIDTH,
        await generateSequentialId(),
    );

    let streetWest1 = new Street(
        streetNorth2.getEnd().forward(STREET_WIDTH * 1.5)
            .rotate(Math.PI / 2)
            .forward(STREET_WIDTH * 1.5),
        STREET_LENGTH, STREET_WIDTH,
        await generateSequentialId(),
    );

    let streetWest2 = new Street(
        streetWest1.getEnd().left(STREET_WIDTH * 1.5)
            .rotate(Math.PI),
        STREET_LENGTH, STREET_WIDTH,
        await generateSequentialId(),
    );

    let streetSouth1 = new Street(
        streetWest2.getEnd().forward(STREET_WIDTH * 1.5)
            .rotate(Math.PI / 2)
            .forward(STREET_WIDTH * 1.5),
        STREET_LENGTH, STREET_WIDTH,
        await generateSequentialId(),
    );

    let streetSouth2 = new Street(
        streetSouth1.getEnd().left(STREET_WIDTH * 1.5)
            .rotate(Math.PI),
        STREET_LENGTH, STREET_WIDTH,
        await generateSequentialId(),
    );

    let turnEast  = new Turn(streetEast1 , streetEast2 , STREET_WIDTH, await generateSequentialId());
    let turnNorth = new Turn(streetNorth1, streetNorth2, STREET_WIDTH, await generateSequentialId());
    let turnWest  = new Turn(streetWest1 , streetWest2 , STREET_WIDTH, await generateSequentialId());
    let turnSouth = new Turn(streetSouth1, streetSouth2, STREET_WIDTH, await generateSequentialId());

    let mainCross = new CrossRoad(
        [
            streetEast2,
            streetNorth2,
            streetWest2,
            streetSouth2,
        ], 
        [
            streetEast1,
            streetNorth1,
            streetWest1,
            streetSouth1,
        ],
        STREET_WIDTH,
        await generateSequentialId()
    );

    await mainCross.loadPaths();

    let streets = [
        streetEast1,
        streetEast2,
        streetNorth1,
        streetNorth2,
        streetWest1,
        streetWest2,
        streetSouth1,
        streetSouth2,
        turnNorth,
        turnWest,
        turnSouth,
        turnEast,
    ];

    let cross = [
        mainCross
    ]

    let cars = [ ];

    streets.forEach((street)=>{
        if (street.type == 'street') {
            cars.push(new Car(street, CAR_WIDTH, CAR_LENGTH, generateSequentialId()));
        }
    });


	cross.forEach((cross)=>{
		cross.startThread();
	});

	cars.forEach((car)=>{
		car.startThread();
	});

    return new Simulation(simulation_id, cars, streets, cross);
}
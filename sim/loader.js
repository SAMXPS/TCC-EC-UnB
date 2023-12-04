class Simulation {
    constructor(id, cars, streets, cross) {
        this.id = id;
        this.cars = cars;
        this.streets = streets;
        this.cross = cross;
        this.elements = [].concat(this.cross).concat(this.streets).concat(this.cars);
    }

    getElements() {
        return this.elements;
    }
}

async function loadSimulation() {

    let simulation_id = await generateRandomId();

    let baseLen = 500;
    let mcenter = new AllignedPosition(0, 0, 0);

    let streetEast1 = new Street(
        mcenter.copy(),
        baseLen, STREET_WIDTH,
        await generateRandomId(),
    );

    let streetEast2 = new Street(
        streetEast1.getEnd().left(STREET_WIDTH * 1.5)
            .rotate(Math.PI),
        baseLen, STREET_WIDTH,
        await generateRandomId(),
    );

    let streetNorth1 = new Street(
        streetEast2.getEnd().forward(STREET_WIDTH * 1.5)
            .rotate(Math.PI / 2)
            .forward(STREET_WIDTH * 1.5),
        baseLen, STREET_WIDTH,
        await generateRandomId(),
    );

    let streetNorth2 = new Street(
        streetNorth1.getEnd().left(STREET_WIDTH * 1.5)
            .rotate(Math.PI),
        baseLen, STREET_WIDTH,
        await generateRandomId(),
    );

    let streetWest1 = new Street(
        streetNorth2.getEnd().forward(STREET_WIDTH * 1.5)
            .rotate(Math.PI / 2)
            .forward(STREET_WIDTH * 1.5),
        baseLen, STREET_WIDTH,
        await generateRandomId(),
    );

    let streetWest2 = new Street(
        streetWest1.getEnd().left(STREET_WIDTH * 1.5)
            .rotate(Math.PI),
        baseLen, STREET_WIDTH,
        await generateRandomId(),
    );

    let streetSouth1 = new Street(
        streetWest2.getEnd().forward(STREET_WIDTH * 1.5)
            .rotate(Math.PI / 2)
            .forward(STREET_WIDTH * 1.5),
        baseLen, STREET_WIDTH,
        await generateRandomId(),
    );

    let streetSouth2 = new Street(
        streetSouth1.getEnd().left(STREET_WIDTH * 1.5)
            .rotate(Math.PI),
        baseLen, STREET_WIDTH,
        await generateRandomId(),
    );

    let turnEast  = new Turn(streetEast1 , streetEast2 , STREET_WIDTH, await generateRandomId());
    let turnNorth = new Turn(streetNorth1, streetNorth2, STREET_WIDTH, await generateRandomId());
    let turnWest  = new Turn(streetWest1 , streetWest2 , STREET_WIDTH, await generateRandomId());
    let turnSouth = new Turn(streetSouth1, streetSouth2, STREET_WIDTH, await generateRandomId());

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
        await generateRandomId()
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

    let cars = [
        new Car(streetEast1, CAR_WIDTH, CAR_LENGTH, [
            streetEast1.name,
            streetEast2.name,
            streetWest1.name,
            streetWest2.name
        ], await generateRandomId()),
    ];

	cross.forEach((cross)=>{
		cross.startThread();
	});

	cars.forEach((car)=>{
		car.startThread();
	});

    return new Simulation(simulation_id, cars, streets, cross);
}
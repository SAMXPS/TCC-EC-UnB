function loadDefaultEntities() {

    let baseLen = 500;
    let mcenter = new AllignedPosition(0, 0, 0);

    let streetA = new Street(
        mcenter.copy(),
        baseLen, STREET_WIDTH,
        'EAST_1',
    );

    let streetB = new Street(
        streetA.getEnd().left(STREET_WIDTH * 1.5)
            .rotate(Math.PI),
        baseLen, STREET_WIDTH,
        'EAST_2',
    );

    let streetC = new Street(
        streetB.getEnd().forward(STREET_WIDTH * 1.5)
            .rotate(Math.PI / 2)
            .forward(STREET_WIDTH * 1.5),
        baseLen, STREET_WIDTH,
        'NORTH_1',
    );

    let streetD = new Street(
        streetC.getEnd().left(STREET_WIDTH * 1.5)
            .rotate(Math.PI),
        baseLen, STREET_WIDTH,
        'NORTH_2',
    );

    let streetE = new Street(
        streetD.getEnd().forward(STREET_WIDTH * 1.5)
            .rotate(Math.PI / 2)
            .forward(STREET_WIDTH * 1.5),
        baseLen, STREET_WIDTH,
        'WEST_1',
    );

    let streetF = new Street(
        streetE.getEnd().left(STREET_WIDTH * 1.5)
            .rotate(Math.PI),
        baseLen, STREET_WIDTH,
        'WEST_2',
    );

    let streetG = new Street(
        streetF.getEnd().forward(STREET_WIDTH * 1.5)
            .rotate(Math.PI / 2)
            .forward(STREET_WIDTH * 1.5),
        baseLen, STREET_WIDTH,
        'SOUTH_1',
    );

    let streetH = new Street(
        streetG.getEnd().left(STREET_WIDTH * 1.5)
            .rotate(Math.PI),
        baseLen, STREET_WIDTH,
        'SOUTH_2',
    );

    let turnAB = new Turn(streetA, streetB, STREET_WIDTH);
    let turnCD = new Turn(streetC, streetD, STREET_WIDTH);
    let turnEF = new Turn(streetE, streetF, STREET_WIDTH);
    let turnGH = new Turn(streetG, streetH, STREET_WIDTH);

    streets = [
        streetA,
        streetB,
        streetC,
        streetD,
        streetE,
        streetF,
        streetG,
        streetH,
        turnCD,
        turnEF,
        turnGH,
        turnAB,
    ];

    cross = [
        new CrossRoad(
            [
                streetB,
                streetD,
                streetF,
                streetH,
            ], [
            streetA,
            streetC,
            streetE,
            streetG,
        ],
            STREET_WIDTH
        ),
    ]

    cars = [
        new Car(streets[0], CAR_WIDTH, CAR_LENGTH, [
            'EAST_1','EAST_2','WEST_1','WEST_2'
        ]),
        new Car(streets[0], CAR_WIDTH, CAR_LENGTH, [
            'EAST_1','EAST_2','WEST_1','WEST_2'
        ], CAR_LENGTH * 2),
        new Car(streets[0], CAR_WIDTH, CAR_LENGTH, [
            'EAST_1','EAST_2','WEST_1','WEST_2'
        ], CAR_LENGTH * 4),


        new Car(streets[1], CAR_WIDTH, CAR_LENGTH,[
            'EAST_1','EAST_2','WEST_1','WEST_2'
        ]),

        new Car(streets[2], CAR_WIDTH, CAR_LENGTH,[
            'NORTH_1','NORTH_2','SOUTH_1','SOUTH_2'
        ]),

        new Car(streets[2], CAR_WIDTH, CAR_LENGTH,[
            'NORTH_1','NORTH_2','SOUTH_1','SOUTH_2'
        ], CAR_LENGTH * 2),
        new Car(streets[2], CAR_WIDTH, CAR_LENGTH,[
            'NORTH_1','NORTH_2','SOUTH_1','SOUTH_2'
        ], CAR_LENGTH * 4),

        new Car(streets[3], CAR_WIDTH, CAR_LENGTH,[
            'NORTH_1','NORTH_2','SOUTH_1','SOUTH_2'
        ]),
        new Car(streets[4], CAR_WIDTH, CAR_LENGTH,[
            'EAST_1','EAST_2','WEST_1','WEST_2'
        ]),
        new Car(streets[5], CAR_WIDTH, CAR_LENGTH,[
            'EAST_1','EAST_2','WEST_1','WEST_2'
        ]),
        new Car(streets[6], CAR_WIDTH, CAR_LENGTH,[
            'NORTH_1','NORTH_2','SOUTH_1','SOUTH_2'
        ]),
        new Car(streets[7], CAR_WIDTH, CAR_LENGTH,[
            'NORTH_1','NORTH_2','SOUTH_1','SOUTH_2'
        ]),
    ];
}
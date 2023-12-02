function Menu() {
    this.setup = function() {
        button = createButton('road');
        button.position(0, 0);
        button.mousePressed(addRoad);
        button.addClass("buttone");

        button2 = createButton('connect');
        button2.position(100, 0);
        button2.mousePressed(addConnect);
        button2.addClass("buttone");
    }

    this.draw = function() {
        push();
            stroke(0); fill(0);
            rect(0,0,screenX,50);
        pop();
    }
}
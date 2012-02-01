
// LITTLE TANK
// PAUL LIVINGSTONE - 2011

// Setup canvas & defaults
var canvas,
    ctx,
    tank,
    width = 320,
    height = 600,
    speed = 3,
    input = {left: false, right: false, fire: true, stop: true}
    missiles = [];
    asteroids = [];
    explosions = [];
    totalAsteroids = 10;
    totalMissiles = 10;
    maximumAsteroidSpeed = 3;
    score = 0;

// Drawing tools
var draw = {
    clear: function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    rect: function(x, y, w, h, col){
        ctx.fillStyle = col;
        ctx.fillRect(x, y, w, h);
    },
    circle: function(x, y, radius, col){
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();
    },
    text: function(str, x, y, size, col){
        ctx.font = "bold " + size + "px Electrolize";
        ctx.fillStyle = col;
        ctx.fillText(str, x, y);
    }
};

 
// Tank class
var Tank = function(){

    this.init = function(){
        this.dead = false;
        this.speed = 4;
        this.dir = [
        [0, 0], // Stop
        [-1, 0], // left
        [1, 0]   // right
        ];


        this.x = 10;
        this.y = 560;
        this.currentDir = 0;
        this.w = 30;
        this.h = 16;
        this.turret_y = this.y - 15;
        this.turret_x = this.x + this.w / 2;
        this.col = "#fff";
    };

    // Move Tank 
    this.move = function(){

        if(this.dead){
            return;
        }

        // Set direction depending on input
        if(input.left){
            this.currentDir = 1;
        } 
        else if (input.right){
            this.currentDir = 2;
        }
        else{
            this.currentDir = 0;
        }

        // Out of bounds
        if(this.x < 0 && this.currentDir == 1)
        {
            this.currentDir = 0;
        }
        else if(this.x > (canvas.width - this.w) && this.currentDir == 2)
        {
            this.currentDir = 0;
        }

        // Adjust position of tank
        this.x += (this.dir[this.currentDir][0] * this.speed);
        this.turret_x = this.x + this.w / 2 + 3;
    };

    // Draw tank shape
    this.draw = function(){
        draw.rect(this.x, this.y, this.w, this.h, "rgba(0,0,0,0)");
        //draw.circle(this.x, (this.y + 15), 5, this.col);
        //draw.circle((this.x + 30), (this.y + 15), 5, this.col);
        //draw.rect((this.x + 12), (this.y - 10), 5, 20, this.col);
        ctx.drawImage(tk, this.x, this.y);
    };

};


// Missile class
var Missile = function(tank){    
    this.init = function(){
        this.dead = false;
        this.armed = false;
        this.speed = 4;
        this.history = [];
        this.x = tank.turret_x;
        this.y = tank.turret_y;
        this.radius = 5;
        this.w = 9;
        this.h = 15;
        this.col = "242, 161, 5";
    };
    
    this.move = function(){
        if(this.dead){
            return;
        }

        if(this.y < 0){
            this.dead = true;
        }

        if(this.history.length > 20){
            this.history.pop();
        }
        else
        {
            this.history.unshift([this.x, this.y]);
        }
        
        this.y += (-1 * this.speed);
    };

    this.draw = function(){
        //draw.circle(this.x, this.y, this.radius, "rgba(" + this.col + ",0)");
        
        var trailRadius = (this.w);
        var trailOpacity = 1.0;
        for(var i = 0; i < this.history.length; i++){
            if(trailRadius <= 0){
                draw.circle(this.history[i][0] + (this.w / 2), this.history[i][1] + this.h, 0.5, "rgba(" + this.col + ",0)");    
            }
            else{
                draw.circle(this.history[i][0] + (this.w / 2) + randomNumberFromRange(-1, 1), this.history[i][1] + this.h, randomNumberFromRange(0.5, 2), "rgba(" + this.col + "," + trailOpacity + ")");
                draw.circle(this.history[i][0] + (this.w / 2) + randomNumberFromRange(-1, 1), this.history[i][1] + this.h, randomNumberFromRange(0.5, 2), "rgba(187, 52, 34," + trailOpacity + ")");
                trailOpacity = trailOpacity - 0.1;
                //trailRadius = trailRadius - 1;
            }
        }

        draw.rect(this.x, this.y, this.w, this.h, "rgba(0,0,0,0)");
        ctx.drawImage(mis, this.x, this.y);
        //draw.rect(this.x - 3, this.y + this.h - 3, 3, 3, "red");
        //draw.rect(this.x + this.w, this.y + this.h - 3, 3, 3, "red");
    };
};

function randomNumberFromRange(from, to){
    return Math.floor(Math.random() * (to - from + 1) + from);
}

// Asteroid class
var Asteroid = function(){
    this.init = function(){
        this.dead = false;
        this.armed = false;
        this.history = [];
        this.speed = randomNumberFromRange(2, maximumAsteroidSpeed);
        this.x = Math.floor(Math.random() * 310);
        this.y = Math.floor(Math.random() * -330);
        // this.radius = randomNumberFromRange(5, 20);
        this.w = this.h = randomNumberFromRange(10, 30);
        this.col = "rgba(0,0,0,0)";
        this.angle = randomNumberFromRange(-2, 2);
    };

    this.move = function(){
        if(this.dead){
            return;
        }

        if(this.y > 590){
            explosions.push(new Explosion((this.x + this.w / 2 ), (this.y + this.h / 2), this.w));
            this.dead = true;
        }

        if(this.x < -50 || this.x > 360){
            this.dead = true;
        }
        
        if(this.history.length > 50){
            this.history.pop();
        }
        else
        {
            this.history.unshift([this.x, this.y]);
        }
        
        this.y += (1 * this.speed);
        this.x += (this.angle + 1);
        
    };

    this.draw = function(){
        draw.rect(this.x, this.y, this.w, this.h, this.col);
        var trailRadius = (this.w / 2);
        var trailOpacity = 1.0;
        var trailIntensity = 252;
        for(var i = 0; i < this.history.length; i++){
            if(trailRadius <= 0){
                draw.circle(this.history[i][0] + (this.w / 2), this.history[i][1] + (this.h / 2), 1, "rgba(252,207,32,0)");    
            }
            else{
                draw.circle(this.history[i][0] + (this.w / 2) + randomNumberFromRange(-1, 1), this.history[i][1] + (this.h / 2), trailRadius, "rgba(" + trailIntensity + ",207,32," + trailOpacity + ")");
                trailOpacity = trailOpacity - 0.05;
                trailRadius = trailRadius - 1;
                trailIntensity = trailIntensity - 5;
            }
        }
    };
}

var Explosion = function(x, y, size){
    this.init = function(){
        this.dead = false;
        this.armed = false;
        this.x = x;
        this.y = y;
        this.size = size;
        this.col = "orange";
    };

    this.move = function(){
        if(this.dead){
            return;
        }

        if(this.size == 0){
            this.dead = true;
        }
        else{
            this.size--;
        }
    };

    this.draw = function(){
        draw.circle(this.x, this.y, this.size, this.col);
    };
}


// Setup canvas, tank, controls & game loop       
function init(){
    canvas = document.getElementById("littleTankCanvas");
    ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    
    document.addEventListener("keydown", keyDown, false);
    document.addEventListener("keyup", keyUp, false);
    tk = new Image();
    tk.src = "tank.png";
    bg = new Image();
    bg.src = "bg.png";
    logo = new Image();
    logo.src = "logo.png";
    mis = new Image();
    mis.src = "missile.png";

    tank = new Tank();
    tank.init();

    setInterval(gameLoop, 20);
}

// Collision detection between missiles & asteroids
function weaponCollision(){
    var remove = false;
    for(var i = 0; i < missiles.length; i++){
        for(var j = 0; j < asteroids.length; j++){
            if(missiles[i].y <= (asteroids[j].y + asteroids[j].h) && missiles[i].x >= asteroids[j].x && missiles[i].x <= (asteroids[j].x + asteroids[j].w)){
                remove = true;
                asteroids[j].dead = true;
                score++;
                explosions.push(new Explosion((asteroids[j].x + (asteroids[j].w / 2)), (asteroids[j].y + (asteroids[j].h / 2 )), asteroids[j].w));
                asteroids.splice(j,1);

            }
        }
        if(remove == true){
            missiles.dead = true;
            missiles.splice(i, 1);
            remove = false;
        }
    }
}

// Collision detection between asteroids & tank
function tankCollision(){
    for(var i = 0; i < asteroids.length; i++){
        if(tank.x > asteroids[i].x && tank.x < (asteroids[i].x + asteroids[i].w) && tank.y > asteroids[i].y && tank.y < (asteroids[i].y + asteroids[i].h)){
            explosions.push(new Explosion((asteroids[i].x + (asteroids[i].w / 2)), (asteroids[i].y + (asteroids[i].h / 2 )), 100));
            tank.dead = true;    
        }
        if((tank.x + tank.w) < asteroids[i].x + asteroids[i].w && (tank.x + tank.w) > asteroids[i].x && tank.y > asteroids[i].y && tank.y < asteroids[i].y + asteroids[i].h){
            explosions.push(new Explosion((asteroids[i].x + (asteroids[i].w / 2)), (asteroids[i].y + (asteroids[i].h / 2 )), 100));
            tank.dead = true;
        }
        if ((tank.y + tank.h) > asteroids[i].y && (tank.y + tank.h) < asteroids[i].y + asteroids[i].h && tank.x > asteroids[i].x && tank.x < asteroids[i].x + asteroids[i].w) {
            explosions.push(new Explosion((asteroids[i].x + (asteroids[i].w / 2)), (asteroids[i].y + (asteroids[i].h / 2 )), 100));
            tank.dead = true;
        }
        if ((tank.y + tank.h) > asteroids[i].y && (tank.y + tank.h) < asteroids[i].y + asteroids[i].h && (tank.x + tank.w) < asteroids[i].x + asteroids[i].w && (tank.x + tank.w) > asteroids[i].x) {
            explosions.push(new Explosion((asteroids[i].x + (asteroids[i].w / 2)), (asteroids[i].y + (asteroids[i].h / 2 )), 100));
            tank.dead = true;
        }
    }
}


// Keep a steady stream of asteroids
function queueAsteroids(){
    for(var i = 0; i < totalAsteroids; i++){
        if(asteroids.length < totalAsteroids){
            asteroids.push(new Asteroid);
        }
    }
}

// Draws & moves cast members (asteroids & missiles)
function drawCastMember(member){
    if(member.length){
        for(var i = 0; i < member.length; i++){
            if(!member[i].armed){
                member[i].init();
                member[i].draw();
                member[i].armed = true;
            }
            else{
                member[i].move();
                member[i].draw();
                if(member[i].dead){
                    member.splice(i, 1);
                }
            }

        }
    }
}

function continueButton(e){  
    missiles = [];
    asteroids = [];
    explosions = [];
    score = 0;
    totalAsteroids = 5;
    tank.dead = false;
}

function incrementWave(){
    switch(score){
        case 10: totalAsteroids = 6; break;
        case 20: totalAsteroids = 20; maximumAsteroidSpeed = 3; break;
        case 30: totalAsteroids = 30; break;
        case 40: totalAsteroids = 50; break;
        case 50: totalAsteroids = 20; break;
        case 60: totalAsteroids = 39; maximumAsteroidSpeed = 4; break;
        case 70: totalAsteroids = 30; break;
        case 80: totalAsteroids = 20; break;
        case 90: totalAsteroids = 40; break;
        case 100: totalAsteroids = 60; break;
        case 150: totalAsteroids = 30; break;
        case 200: totalAsteroids = 50; maximumAsteroidSpeed = 6; break;
    }
}


function gameLoop(){
    // Next frame
    draw.clear();
    ctx.drawImage(bg, 0, 0);
    drawCastMember(explosions);
    drawCastMember(asteroids);
    drawCastMember(missiles);

    if(!tank.dead){
        // Draw cast
        
        
        

        // Collision detection
        weaponCollision();
        tankCollision();

        incrementWave();

        // Steady stream of asteroids
        queueAsteroids();
        tank.draw();
        tank.move();
        // Indicators
        //draw.text("tank position: " + tank.x, 100, 100, 20, "darkgreen");
        //draw.text("turret position: " + tank.turret_x, 100, 110, 12, "black");
        //draw.text("weapon ready: " + input.fire, 200, 20, 20, "black");
        draw.text("missiles: " + missiles.length, 200, 20, 15, "#fff");
        draw.text("incoming: " + asteroids.length, 200, 40, 15, "#fff");
        draw.text("SCORE: " + score, 10, 20, 15, "#fff");
    }
    else{    
            draw.text("GAME OVER!", 30, 280, 40, "#fff");
            draw.text("Score: " + score, 30, 310, 15, "#fff");
            draw.text("Click to try again...", 30, 330, 20, "#fff");
            canvas.addEventListener("click", continueButton, false);
            ctx.drawImage(logo, 0, 0);
    }

}

function keyDown(e){
    switch(e.keyCode){
        case 37: input.left = true; break;
        case 39: input.right = true; break;
        case 32: input.fire = false; 
    }
}

function keyUp(e){
    switch(e.keyCode){
        case 37: input.left = false; break;
        case 39: input.right = false; break;
        case 32: input.fire = true; if(missiles.length < totalMissiles && tank.dead == false){missiles.push(new Missile(tank));} break;
    }
}

window.onload = init;


    


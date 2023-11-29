const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext('2d');
const StepsPerFarme = 100
const ToScreenMul = 8
const TimeStep = 0.01

class Vector {
    constructor(x, y){
        this.x = x || 0;
        this.y = y || 0;
        this.update();
    }

    getDirection(){
        return Math.atan2(this.y, this.x);
    }

    getMagnitude(){
        return Math.sqrt(Math.max(this.x * this.x + this.y * this.y));
    }

    addtoVector(v2){
        this.x += v2.x;
        this.y += v2.y;
        this.update();
    }

    static add(v1, v2){
        return new Vector(v1.x + v2.x, v1.y + v2.y)
    }

    substractfromVector(v2){
        this.x -= v2.x;
        this.y -= v2.y;
        this.update();
    }

    multiplyVector(scalar){
        this.x *= scalar;
        this.y *= scalar;
        this.update();
    }

    static multiply(v1, scalar){
        return new Vector(v1.x * scalar , v1.y * scalar)
    }

    divideVector(scalar){
        this.x /= scalar;
        this.y /= scalar;
        this.update();
    }

    static divide(v1, scalar){
        return new Vector(v1.x / scalar , v1.y / scalar)
    }

    update(){
        this.direction = this.getDirection()
        this.magnitude = this.getMagnitude()
    }

    static CreateFromMagDir(magnitude, direction){
        var res = new Vector()
        res.magnitude = magnitude;
        res.direction = direction;
        res.x = res.magnitude * Math.cos(res.direction);
        res.y = res.magnitude * Math.sin(res.direction);
        return res;
    }
}


class GravityfallProg{
    constructor(){
        this.GConst = 1e+0;
        this.bgimg = new Image();
        this.imgLoaded = false
        this.bgimg.src = "images/bg.png"
        this.bgimg.onload = () => this.imgLoaded = true
        this.time = 0
        this.sun = new Image();
        this.sun.src = "images/sun.png"
        this.sun.onload = () => this.imgLoaded = true
        this.earth = new Image();
        this.earth.src = "images/earth.png"
        this.earth.onload = () => this.imgLoaded = true
        this.moon = new Image();
        this.moon.src = "images/moon.png"
        this.moon.onload = () => this.imgLoaded = true
        var tmppoints = [
            {
                Mass: 1.5,
                Position: new Vector(0, 0),
                Velocity: new Vector(0, -0.01),
                Color: "rgb(223, 50, 2)",
                Radius: 30
            },
            {
                Mass: 5e-2,
                Position: new Vector(-21, 0),
                Velocity: new Vector(0, 0.3),
                Color: "rgb(36, 171, 255)",
                Radius: 7
            },
            {
                Mass: 2e-9,
                Position: new Vector(-21, -3),
                Velocity: new Vector(0.10, 0.30),
                Color: "rgb(240, 240, 240)",
                Radius: 3
            },
            {
                Mass: 7e-9,
                Position: new Vector(10, 0),
                Velocity: new Vector(0, -0.4),
                Color: "rgb(0, 170, 53)",
                Radius: 6
            },
        ];
        this.points = tmppoints.map(point => new Particle(point.Mass, point.Position, point.Velocity, point.Color, point.Radius))
        this.withTime = false;
        this.dt = TimeStep;
        this.t = 0;
    }

    iter() {
       // while(t < 10){
            ctx.fillStyle = "black";
            if(ifcheck() != true){
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            for(var i = 0; i < StepsPerFarme; i++){
                this.points = this.Rk4Step(this.points, this.dt);
            }
            
            // ctx.beginPath()
            // ctx.arc(this.xtoscreen(this.points[0].Position.x), this.ytoscreen(this.points[0].Position.y), 50, 0, 2 * Math.PI);
            // ctx.fillStyle = "rgb(223, 50, 2)"
            // ctx.fill()
            // ctx.beginPath()
            // ctx.arc(this.xtoscreen(this.points[1].Position.x), this.ytoscreen(this.points[1].Position.y), 5, 0, 2 * Math.PI);
            // ctx.fillStyle = "rgb(36, 171, 186)"
            // ctx.fill()
            // ctx.beginPath()
            // ctx.arc(this.xtoscreen(this.points[2].Position.x), this.ytoscreen(this.points[2].Position.y), 5, 0, 2 * Math.PI);
            // ctx.fillStyle = "rgb(67, 67, 67)"
            // ctx.fill()
            this.points.forEach(point => this.drawPoint(point));
            if (false){
                console.log(this.points[0].Position.x + ";" + this.points[0].Position.y)
                console.log(this.points[1].Position.x + ";" + this.points[1].Position.y)           
                console.log(this.points[2].Position.x + ";" + this.points[2].Position.y)
            }
            this.t += this.dt;
    }


    Rk4Step(points, h){
        const k1 = this.f(points);
        const sys2 = this.step(points, points, k1, h * 0.5);
        const k2 = this.f(sys2);
        const sys3 = this.step(points, sys2, k2, h * 0.5);
        const k3 = this.f(sys3);
        const sys4 = this.step(points, sys3, k1, h);
        const k4 = this.f(sys4);
        const dv = [
                k1,
                this.multb(2, k2),
                this.multb(2, k3),
                k4
            ]
            .reduce((ki, kii) => this.addtb(ki, kii))
            .map(el => Vector.multiply(el, h / 6));

        const dr0 = [
                points.map(el => el.Velocity),
                sys2.map(el => Vector.multiply(el.Velocity, 2)),
                sys3.map(el => Vector.multiply(el.Velocity, 2)),
                sys4.map(el => el.Velocity)
            ]
        var dr = dr0
            .reduce((ki, kii) => this.addtb(ki, kii))
            .map(el => Vector.multiply(el, h / 6));
            
        return this.step_in(points, dv, dr);
    }

    multb(d, inp) {
        return inp.map(el => Vector.multiply(el, d));
    }

    addtb(tbv1, tbv2) {
        // return inp.map(el => Vector.add(el, d));
        let zipped = []
        for(let i = 0; i < tbv1.length; i++){
              zipped.push(Vector.add(tbv1[i], tbv2[i]))
        }
        return zipped;    
    }

    f(system) {
        return system.map(sys => this.accelerationComp(sys, system));
    }

    step(toMove, state, acc, h) {
        // return toMove.map((el, i) => {
        //     return{
        //         Mass: el.Mass,
        //         Velocity: el.Velocity + acc[i],
        //         Position: el.Position + state[i] * h
        //     };
        // });
        return this.step_in(toMove, this.multb(h, acc), this.multb(h, state.map(el=>el.Velocity)) )
    }

    step_in(system, dv, dr) {

        let result = []
        for (let i = 0; i < system.length; i++) {
            var el = system[i]
            result.push(new Particle(el.Mass, Vector.add(el.Position, dr[i]), Vector.add(el.Velocity, dv[i]), el.Color, el.Radius))
        }

        return result;
        // return toMove.map((el, i) => {
        //     return{
        //         Mass: el.Mass,
        //         Velocity: el.Velocity + acc[i],
        //         Position: el.Position + state[i] * h
        //     };
        // });
    }

    eulerStep(points, dt) {
        return this.eulerStep(points, points, dt)
    }

    eulerStep(toMove, system, dt) {
        if(toMove.length !== system.length){
            throw new Error(`EulerStep toMove.Length != system.length ${toMove.length} ${system.length}`)
        }
        const hf = this.multb(dt, this.f(system));
        return this.step(toMove, hf, system.map((sys, i) => dt * (sys.Velocity + hf[i])));
    }

    accelerationComp(me, system) {
        const allOther = system.filter(el => el !== me);
        const force = allOther.map(other => {
            const r = Vector.add(me.Position, Vector.multiply(other.Position, -1));
            let len = r.getMagnitude()
            len = Math.max(0.5, len);
            var acc = Vector.multiply(r, -this.GConst * other.Mass * me.Mass / len / len / len);
            return acc;
        }).reduce((v1, v2) => Vector.add(v1, v2))
        return Vector.multiply(force, 1.0 / me.Mass);
    }
    xtoscreen(l) {
        return Math.round(l * ToScreenMul + canvas.width / 2)
    }
    
    ytoscreen(l) {
        return Math.round(l * ToScreenMul + canvas.height / 2)
    }

    drawPoint(point){
        ctx.beginPath()
        ctx.arc(this.xtoscreen(point.Position.x), this.ytoscreen(point.Position.y), point.Radius, 0, 2 * Math.PI);
        ctx.fillStyle = point.Color;
        ctx.fill()
    }
    print(){
        this.points.forEach(point => console.log(point));
    }
}

class Particle {
    constructor(mass, position, velocity, color, radius){
        this.Mass = mass;
        this.Position = position;
        this.Velocity = velocity;
        this.Color = color;
        this.Radius = radius;
    }
}

var newprog = new GravityfallProg();
//newprog.run()

window.onload = function () {
    // document.addEventListener("keydown", keyDown);
    // document.addEventListener("keyup", keyUp);
    // //setInterval(update, 10);
    window.requestAnimationFrame(update)
}

function update() {
    newprog.iter()
    window.requestAnimationFrame(update)
}

function button(){
    newprog.print()
}

function ifcheck(){
    var cb = document.getElementById("check")
    if(cb.checked){
        return true
    }
}

// module.exports = {
//     Vector:Vector,
//     GravityfallProg: GravityfallProg
//     }

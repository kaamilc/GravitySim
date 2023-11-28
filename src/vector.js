const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext('2d');


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
        this.points = [
            {
                Mass: 1.1,
                Position: new Vector(0, 0, 0),
                Velocity: new Vector(0, -0.01, 0)
            },
            {
                Mass: 4e-2,
                Position: new Vector(-10, -3, 1),
                Velocity: new Vector(0, 0.3, 0.05)
            },
            {
                Mass: 3e-9,
                Position: new Vector(-10.5, -3.3, 1.1),
                Velocity: new Vector(0, 0.285, -0.05)
            }
        ];
        this.withTime = false;
        this.dt = 0.05;
        this.t = 0;
    }

    iter() {
       // while(t < 10){
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            this.points = this.Rk4Step(this.points, this.dt);
            ctx.beginPath()
            ctx.arc(this.xtoscreen(this.points[0].Position.x), this.ytoscreen(this.points[0].Position.y), 50, 0, 2 * Math.PI);
            ctx.fillStyle = "rgb(223, 50, 2)"
            ctx.fill()
            ctx.beginPath()
            ctx.arc(this.xtoscreen(this.points[1].Position.x), this.ytoscreen(this.points[1].Position.y), 5, 0, 2 * Math.PI);
            ctx.fillStyle = "rgb(36, 171, 186)"
            ctx.fill()
            ctx.beginPath()
            ctx.arc(this.xtoscreen(this.points[2].Position.x), this.ytoscreen(this.points[2].Position.y), 5, 0, 2 * Math.PI);
            ctx.fillStyle = "rgb(67, 67, 67)"
            ctx.fill()


            console.log(this.points[0].Position.x + ";" + this.points[0].Position.y)
            console.log(this.points[1].Position.x + ";" + this.points[1].Position.y)           
            console.log(this.points[2].Position.x + ";" + this.points[2].Position.y)
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
            result.push(
                {
                    Mass: el.Mass,
                    Velocity: Vector.add(el.Velocity, dv[i]),
                    Position: Vector.add(el.Position, dr[i])
                }
            )
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
        return Math.round(l * 20 + canvas.width / 2)
    }
    
    ytoscreen(l) {
        return Math.round(l * 20 + canvas.height / 2)
    }
}

class Particle {
    constructor(mass, position, velocity){
        this.Mass = mass;
        this.Position = position;
        this.Velocity = velocity;
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

// module.exports = {
//     Vector:Vector,
//     GravityfallProg: GravityfallProg
//     }

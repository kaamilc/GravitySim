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

    divideVector(scalar){
        this.x /= scalar;
        this.y /= scalar;
        this.update();
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

module.exports = {
    Vector:Vector
    }

const MathNet = require('mathnet.numerics')
class GravityfallProg{
    constructor(){
        this.GConst = 1e+0;
    }

    run() {
        MathNet.Control.UseManaged();
        const random = new MathNet.random.random();
        const points = [
            {
                Mass: 1.1,
                Position: this.vec3D(0, 0, 0),
                Velocity: this.vec3D(0, -0.01, 0)
            },
            {
                Mass: 4e-2,
                Position: this.vec3D(-10, -3, 1),
                Velocity: this.vec3D(0, 0.3, 0.05)
            },
            {
                Mass: 3e-9,
                Position: this.vec3D(-10.5, -3.3, 1.1),
                Velocity: this.vec3D(0, 0.285, -0.05)
            }
        ];
        const withTime = false;
        const files = points.map((points, idx) => {
            const name = `res${idx}.csv`;
            const file = new File(name);
            file.writeLine(withTime ? "t; x; y; z" : "x; y; z");
            return { file, name };
        });
        let dt = 0.05;
        let t = 0;
        while(t < 1450){
            points - this.Rk4Step(points, dt, files, withTime, t);
            for (let i = 0; i < points.length; i++) {
                const el = points[i];
                const file = files[i].file;
                const toPrint = withTime ? [t].concat(el.Position.toArray()) : el.Position.toArray();
                file.writeLine(toPrint.map(it => it.toString()).join(";"));
            }
            t += dt;
        }
        files.forEach(el => {
            el.file.dispose();
        });
    }

    vec3D(x, y, z = 0){
        return MathNet.Vector.DenseOfArray([x, y, z]);
    }

    Rk4Step(points, h, files, withTime, t){
        const k1 = this.f(points);
        const sys2 = this.step(points, points, k1, h * 0.5);
        const k2 = this.f(sys2);
        const sys3 = this.step(points, sys2, k2, h * 0.5);
        const k3 = this.f(sys3);
        const sys4 = this.step(points, sys3, k1, h);
        const k4 = this.f(sys4);
        const dv = [
            k1,
            this.mul(2, k2),
            this.mul(2, k3),
            k4
        ].reduce((ki, kii) => ki.map((e1, i) => e1 + kii[i]));
        const dr = [
            points.map(el => el.Velocity),
            sys2.map(el => this.mul(2, el.Velocity)),
            sys3.map(el => this.mul(2, el.Velocity)),
            sys4.map(el => el.Velocity)
        ];
    }
}
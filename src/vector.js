
class Vector {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
        this.update();
    }

    getDirection() {
        return Math.atan2(this.y, this.x);
    }

    getMagnitude() {
        return Math.sqrt(Math.max(this.x * this.x + this.y * this.y));
    }

    addtoVector(v2) {
        this.x += v2.x;
        this.y += v2.y;
        this.update();
    }

    static add(v1, v2) {
        return new Vector(v1.x + v2.x, v1.y + v2.y)
    }

    substractfromVector(v2) {
        this.x -= v2.x;
        this.y -= v2.y;
        this.update();
    }

    multiplyVector(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.update();
    }

    static multiply(v1, scalar) {
        return new Vector(v1.x * scalar, v1.y * scalar)
    }

    divideVector(scalar) {
        this.x /= scalar;
        this.y /= scalar;
        this.update();
    }

    static divide(v1, scalar) {
        return new Vector(v1.x / scalar, v1.y / scalar)
    }

    update() {
        this.direction = this.getDirection()
        this.magnitude = this.getMagnitude()
    }

    static CreateFromMagDir(magnitude, direction) {
        var res = new Vector()
        res.magnitude = magnitude;
        res.direction = direction;
        res.x = res.magnitude * Math.cos(res.direction);
        res.y = res.magnitude * Math.sin(res.direction);
        return res;
    }
}

// module.exports = {
//     Vector:Vector,
//     GravityfallProg: GravityfallProg
//     }

const Vector = require('../src/vector').Vector;
const GravityfallProg = require('../src/vector').GravityfallProg;
const expect = require('chai').expect;

const epsilon = 0.0001;
describe('Describe Vector', function(){
    it('1. Magnitude', function(done){  
        let v1 = new Vector(3, 4);
        expect(v1.getMagnitude()).to.equal(5);
        done()
    })

    it('2. Angle', function(done){
        let v2 = new Vector(20, 20);
        expect(Math.abs(v2.getDirection() - 45/180.0 * Math.PI) < epsilon).is.equal(true);
        done()
    })

    it('3. Multiply', function(done){
        let v3 = new Vector(3, 4);
        let scalar1 = 4;
        v3.multiplyVector(scalar1)
        expect(v3.getMagnitude()).to.equal(20);
        done()
    })

    it('4. Divide', function(done){
        let v4 = new Vector(12, 16);
        let scalar2 = 4;
        v4.divideVector(scalar2)
        expect(v4.getMagnitude()).to.equal(5);
        done()
    })

    it('5. Add', function(done){
        let v5 = new Vector(12, 16);
        let added = new Vector(3, 4)
        v5.addtoVector(added)
        expect(v5.getMagnitude()).to.equal(25);
        done()
    })

    it('6. Substract', function(done){
        let v6 = new Vector(12, 16);
        let substracted = new Vector(9, 12)
        v6.substractfromVector(substracted)
        expect(v6.getMagnitude()).to.equal(5);
        done()
    })

    it('7. Get x and y', function(done){
        let v6 = Vector.CreateFromMagDir(Math.sqrt(2) * 10, 45 / 180 * Math.PI);
        expect(Math.abs(v6.x - 10) < epsilon).is.equal(true);
        expect(Math.abs(v6.y - 10) < epsilon).is.equal(true);
        done()
    })

    it('8. test', function(done){
        let prog = new GravityfallProg()
        prog.run()
        // expect(Math.abs(v2.getDirection() - 45/180.0 * Math.PI) < epsilon).is.equal(true);
        done()
    })

    it('9. Add2', function(done){
        let v5 = new Vector(12, 16);
        let added = new Vector(3, 4)
        res = Vector.add(v5, added)
        expect(res.getMagnitude()).to.equal(25);
        done()
    })

});
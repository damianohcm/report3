const chai = require('chai')
	, expect = chai.expect
	, mochaTestdata = require('mocha-testdata')
	, given = mochaTestdata.given
    , _refErr = new Error('Unit test reference error');

// model lookups 
const audienceOptions = [{
    id: 1,
    text: 'All Active Store Personnel'
}, {
    id: 2,
    text: 'Active Managers Only'
}, {
    id: 3,
    text: 'Active Shift Leaders only'
}];

const hiredOptions = [{
    id: 1,
    text: 'Since the beginning of time',
    otherField: undefined
}, {
    id: 2,
    text: 'After selected date ',
    otherField: 'hiredAfter'
}];

// orig values to restore on model after changing during tests
const origAudienceOption = audienceOptions[0], origHiredOption = hiredOptions[0], 
origHiredAfter = '1/21/2012' /* dont use undefined */, 
origStores = [{
    id: 1, name: 'Store1', selected: false
}, {
    id: 2, name: 'Store2', selected: true
}],
origDummBool = true,
origCourses = [{
    id: 1, name: 'Course 1', selected: false
}, {
    id: 2, name: 'Course 2', selected: true
}];

// model 
const model = {
    // step 1
    stores: JSON.parse(JSON.stringify(origStores)),
    // step 2:
    audience: origAudienceOption,
    hired: origHiredOption,
    hiredAfter: origHiredAfter, /* dont use undefined */
    // step 3
    dummBool: origDummBool,
    courses: JSON.parse(JSON.stringify(origCourses))
};

// original model to compare
const originalModel = JSON.parse(JSON.stringify(model));

//var _ = require('underscore');
// var areEqual = function(origModel, otherModel) {
//     var result = true;

//     var origKeys = Object.keys(origModel);
//     var otherKeys = Object.keys(otherModel);

//     console.log('origKeys vs otherKeys length ', origKeys.length, otherKeys.length);
    
//     if (origKeys.length !== otherKeys.length) {
//         result = false;
//     } else {
//         for (var i = origKeys.length; --i > -1;) {
//             var origKey = origKeys[i], origType = typeof origModel[origKey], otherType = typeof otherModel[origKey];

//             console.log(origKey + ': typeof ', origType, otherType);

//             if (origType !== otherType) {
//                 console.log(origKey + ': types do not match');
//                 result = false;
//                 break;
//             } else {
//                 if (['boolean', 'string', 'number'].indexOf(origType) > -1) {
//                     if (origModel[origKey] !== otherModel[origKey]) {
//                         console.log(origKey + ': values do not match');
//                         result = false;
//                         break;
//                     };
//                 } else if (Array.isArray(origModel[origKey])) {
//                     console.log(origKey + ': is array ');
//                     if (origModel[origKey].length !== otherModel[origKey].length) {
//                         console.log(origKey + ': array lengths do ot match ');
//                         result = false;
//                         break;
//                     }
//                 } else {
//                     result = areEqual(origModel[origKey], otherModel[origKey]);
//                 }
//             }
//         }
//     }
    
//     return result;
// };

var sortCompareById = function(a, b) {
    if (a.id < b.id) {
        return -1;
    }
    if (a.id > b.id) {
        return 1;
    }
    // a must be equal to b
    return 0;
};

var sortObject = function(obj) {
    if (Array.isArray(obj)) {
        return obj.sort(sortCompareById);
    } else {
        var result = {};
        var sortedKeys = Object.keys(obj).sort();
        for (var i = sortedKeys.length; --i > -1;) {
            var key = sortedKeys[i], propVal = obj[key];
            if (typeof propVal === 'object' || Array.isArray(propVal)) {
                //console.log(key + ': is object or array');
                result[key] = sortObject(propVal);
            } else {
                result[key] = obj[key];
            }
        }

        return result;
    }
};

var areEqual = function(origObj, otherObj) {
    var result = true;

    var origKeys = Object.keys(origObj);
    var otherKeys = Object.keys(otherObj);

    if (origKeys.length !== otherKeys.length) {
        console.log('keys length do not match');
        result = false;
    } else {
        // sort properties and create two object that can be hashed for quicker comparison
        origObj = sortObject(origObj);
        otherObj = sortObject(otherObj);
        
        //console.log('json1', JSON.stringify(origObj).toLowerCase());
        //console.log('json2', JSON.stringify(otherObj).toLowerCase());
        
        if (JSON.stringify(origObj).toLowerCase() !== JSON.stringify(otherObj).toLowerCase()) {
            console.log('hashed objects do not match');
            result = false;
        }
    }
    
    return result;
};

/* tests */
describe('test areEqual', () => {

    it('areEqual: should be true', function(done) {
        var result = areEqual(model, originalModel);
        expect(result).to.equal(true);
        done();
    });

    it('areEqual: should be false after changing audience', function(done) {
        //change object property on model and compare again
        console.log('model.audience was', model.audience);
        model.audience = audienceOptions[1];
        console.log('model.audience is now', model.audience);
        var result = areEqual(model, originalModel);
        console.log('result after changing audience', result);
        expect(result).to.equal(false);

        //restore orig value
        model.audience = origAudienceOption;
        result = areEqual(model, originalModel);
        console.log('result after restoring audience', result);
        expect(result).to.equal(true);

        done();
    });

    it('areEqual: should be false after changing hired', function(done) {
        //change object property on model and compare again
        console.log('model.hired was', model.hired);
        model.hired = hiredOptions[1];
        console.log('model.hired is now', model.hired);
        var result = areEqual(model, originalModel);
        console.log('result after changing hired', result);
        expect(result).to.equal(false);

        //restore orig value
        model.hired = origHiredOption;
        result = areEqual(model, originalModel);
        console.log('result after restoring hired', result);
        expect(result).to.equal(true);

        done();
    });

    it('areEqual: should be false after changing hiredAfter', function(done) {
        //change value property on model and compare again
        console.log('model.hiredAfter was', model.hiredAfter);
        model.hiredAfter = '3/31/1978';
        console.log('model.hiredAfter is now', model.hiredAfter);
        var result = areEqual(model, originalModel);
        console.log('result after changing hiredAfter', result);
        expect(result).to.equal(false);

        //restore orig value
        model.hiredAfter = origHiredAfter;
        result = areEqual(model, originalModel);
        console.log('result after restoring hiredAfter', result);
        expect(result).to.equal(true);

        done();
    });

    it('areEqual: should be false after changing stores array', function(done) {
        //change array property on model and compare again
        console.log('model.stores was', model.stores);
        model.stores.push({
            id: 3,
            name: 'Store 3',
            selected: false
        });
        console.log('model.stores is now', model.stores);
        var result = areEqual(model, originalModel);
        console.log('result after changing stores', result);
        expect(result).to.equal(false);

        console.log('origStores', origStores);

        //restore orig value
        model.stores = JSON.parse(JSON.stringify(origStores));
        result = areEqual(model, originalModel);
        console.log('result after restoring stores', result);
        expect(result).to.equal(true);

        done();
    });

    it('areEqual: should be false after changing stores array item', function(done) {
        //change array item property on model and compare again
        var origVal = model.stores[0].selected;
        console.log('model.stores[0].selected  was', origVal);
        model.stores[0].selected = !origVal;
        console.log('model.stores[0].selected  is now', model.stores[0].selected);
        var result = areEqual(model, originalModel);
        console.log('result after changing stores item', result);
        expect(result).to.equal(false);

        //restore orig value
        model.stores[0].selected = origVal;
        result = areEqual(model, originalModel);
        console.log('result after restoring stores item', result);
        expect(result).to.equal(true);

        done();
    });

});

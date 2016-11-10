'use strict';

const fs = require('fs');

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const personLoModel = { 
    id: '', 
    value: -1, 
    segmentId: ''
};

const generate = (dataModel, filename) => {
    var rand;

    let randomStoreIndex = getRandomInt(0, dataModel.stores.length - 1);

    dataModel.stores.forEach((store, storeIndex) => {
        console.log('store', store.id);

        let randomPersonIndex = getRandomInt(0, store.people.length - 1);
        let randomSegmentIndex = getRandomInt(0, dataModel.segments.length - 1);
        let storeComplete = false;
        if (storeIndex === randomStoreIndex) {
            console.log('make it completed ', store.name);
            storeComplete = true;
        }

        store.people.forEach((person, personIndex) => {
            console.log('person (' + personIndex + ') ' + person.id);
            console.log('randomPersonIndex ' + randomPersonIndex);

            dataModel.segments.forEach((segment, segmentIndex) => {
                //console.log('segment', segment.id);
                console.log('segmentIndex ' + segmentIndex);
                console.log('randomSegmentIndex ' + randomSegmentIndex);

                var segmCheck = 2;

                if (storeComplete || (personIndex === randomPersonIndex && segmentIndex === randomSegmentIndex)) {
                    console.log('make it completed ', segment.name, person.name);
                    segmCheck = 2;
                } else {
                    // occcasionally mark the whole segment completed so we can see the green color on the summaries
                    rand = Math.random();
                    segmCheck = rand > 0.2 ? 2 : 0;
                }

                segment.los.forEach((lo) => {
                    //console.log('lo', lo);

                    if (person.title === 'Manager' && lo.id.indexOf('crew') > -1) {
                        // ignore
                    } else {
                        rand = Math.random();
                        personLoModel.id = lo.id;
                        personLoModel.segmentId = segment.id;
                        personLoModel.value = segmCheck === 2 || rand > 0.2 ? 2 : rand > 0.5 ? 1 : 0;
                        
                        person.los.push(JSON.parse(JSON.stringify(personLoModel)));
                    }
                });
            });

        });
    });

    //console.log('final data model', JSON.stringify(dataModel));
    fs.writeFileSync(__dirname + '/../app/data/[filename].json'.replace('[filename]', filename), 
        JSON.stringify(dataModel));


};


let fakeSegments = JSON.parse(fs.readFileSync('fake-segments.json')).segments,
    fakeStores = JSON.parse(fs.readFileSync('fake-stores.json')).stores,
    fakePeople = JSON.parse(fs.readFileSync('fake-people.json')).people;

let howManyStores = 25, howManyPeople = 25;

let people = fakePeople.slice(0, howManyPeople).map((p, index) => {
    return {
        "id": p.id,
        "name": p.name,
        "title": index > 0 ? 'Manager' : 'Crew',
        "org_guid": 75, 
        "los": []
    };
});

let stores = fakeStores.slice(0, howManyStores).map((store) => {
    return {
        "id": store.id,
        "name": store.name,
        "people": JSON.parse(JSON.stringify(people))
    };
});

// build a model with some base data
let dataModel = {
    segments: fakeSegments,
    stores: stores
};

/// generate a "learning-path" report
generate(dataModel, 'learning-path');
//console.log('base data model', dataModel);

// text = fs.readFileSync('new-and-trending-base.json');
// dataModel = JSON.parse(text.toString());
// generate(dataModel, 'new-and-trending');
// //console.log('base data model', dataModel);


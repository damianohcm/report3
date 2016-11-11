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

let completedChance = 0.5, progressChance = 0.5;

const generate = (dataModel, filename) => {

    const _fixLoProps = function(lo) {
        lo.id = (lo.id || lo.loid);
        lo.name = (lo.title || lo.name);
        lo.type = (lo.item_type || lo.type || 'not set');
        return lo;
    };

    const processLo = function(item, segment, person, segmCheck) {
        item = _fixLoProps(item);
        //console.log('processLo: type or id: ' + (item.type || item.loid) + '; name: ', item.name);

        if (['section', 'curriculum'].indexOf(item.type.toLowerCase()) === -1) {

            if (person.title === 'Manager' && segment.name.toLowerCase().indexOf('crew') > -1) {
                // ignore
            } else {
                const rand = Math.random();
                personLoModel.id = item.id;
                personLoModel.segmentId = segment.id;
                personLoModel.value = segmCheck === 2 || rand > completedChance ? 2 : rand > progressChance ? 1 : 0;
                
                person.los = person.los || [];
                person.los.push(JSON.parse(JSON.stringify(personLoModel)));
            }
            
        } else {
            if (item.los && item.los.length > 0) {
                item.los.forEach((childLo) => {
                    processLo(childLo, segment, person, segmCheck);
                });
            }
        }
    };

    let randomStoreIndex = getRandomInt(0, dataModel.stores.length - 1);

    // loop through stores
    dataModel.stores.forEach((store, storeIndex) => {
        console.log('store', store.id);

        let randomPersonIndex = getRandomInt(0, store.people.length - 1);
        let randomSegmentIndex = getRandomInt(0, dataModel.segments.length - 1);
        let storeComplete = false;
        if (storeIndex === randomStoreIndex) {
            console.log('make all store completed ', store.name);
            storeComplete = true;
        }

        store.people.forEach((person, personIndex) => {
            //console.log('person (' + personIndex + ') ' + person.id, person);
            //console.log('randomPersonIndex ' + randomPersonIndex);

            dataModel.segments.forEach((segment, segmentIndex) => {
                segment.name = (segment.name || segment.title);
                //console.log('segment', segment.id);
                //console.log('segmentIndex ' + segmentIndex);
               // console.log('randomSegmentIndex ' + randomSegmentIndex);

                var segmCheck = 2;

                if (storeComplete || (personIndex === randomPersonIndex && segmentIndex === randomSegmentIndex)) {
                    //console.log('make it completed ', segment.name, person.name);
                    segmCheck = 2;
                } else {
                    // occcasionally mark the whole segment completed so we can see the green color on the summaries
                    segmCheck = Math.random() > completedChance ? 2 : 0;
                }

                //console.log('segment.los', segment.los);
                segment.los.forEach((lo) => {
                    //console.log('lo before fixing and processing', lo);

                    processLo(lo, segment, person, segmCheck);
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
completedChance = 0.4;
progressChance = 0.3;

// make a random person Manager
let people = fakePeople.slice(0, howManyPeople).map((p, index) => {
    return {
        id: p.id,
        name: p.name,
        title: 'Crew',
        org_guid: 75, 
        los: []
    };
});

let randomPersonIndex = getRandomInt(0, people.length - 1);
people[randomPersonIndex].title = 'Manager';

let stores = fakeStores.slice(0, howManyStores).map((store) => {
    return {
        id: store.id,
        name: store.name,
        people: JSON.parse(JSON.stringify(people))
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


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


/// generate a "learning-path" report
let text = fs.readFileSync('report-base.json'),
    dataModel = JSON.parse(text.toString());
generate(dataModel, 'learning-path');
//console.log('base data model', dataModel);

text = fs.readFileSync('new-and-trending-base.json');
dataModel = JSON.parse(text.toString());
generate(dataModel, 'new-and-trending');
//console.log('base data model', dataModel);


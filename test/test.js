'use strict';

const { expect } = require('chai');
const { sanitizeName } = require('../index');
const path = require('path');

const tests = [
    { args: ['/trace-sets/12/backfill/', 'WLG201802261902_archived.tiff'], result: '/trace-sets/12/low-priority-trace-sets/archive/201802261902.tiff' },
    { args: ['/trace-sets/12/backfill/', 'WLG201802261902.tiff'], result: '/trace-sets/12/low-priority-trace-sets/telemetered/201802261902.tiff' },
    { args: ['/trace-sets/12/backfill/', 'WLG201802261902_error.tiff'], result: '/trace-sets/12/low-priority-trace-sets/telemetered/201802261902_error.tiff' },
    { args: ['/trace-sets/12/backfill/', 'WLG201802261902_archived_error.tiff'], result: '/trace-sets/12/low-priority-trace-sets/archive/201802261902_error.tiff' }
];

const runTests = () => {
    tests.forEach(testItem => {
        const output = sanitizeName.apply(null, testItem.args);
        expect(path.normalize(output)).to.equal(path.normalize(testItem.result));
    });
};

runTests();

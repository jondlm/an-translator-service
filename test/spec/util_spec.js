var Lab = require('lab');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var expect = Lab.expect;

var util = require('../../lib/util');

describe('uuid validator', function () {
  it('validates good uuids', function(done) {
    expect(util.validUUID('bddb1220-2cae-11e4-805f-67c4f574a85f')).to.equal(true);
    expect(util.validUUID('123e4567-e89b-12d3-a456-426655440000')).to.equal(true);
    done();
  });

  it('does not validate bad uuids', function(done) {
    expect(util.validUUID('bddb12202cae11e4805f67c4f574a85faa')).to.equal(false);
    expect(util.validUUID('hello!')).to.equal(false);
    expect(util.validUUID('bddb1220-2cae-11e4-805f-67c4f574a85faaZZZ')).to.equal(false);
    done();
  });
});


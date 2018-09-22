import assert from 'assert';

import * as utils from '../src/js/utils';

describe('utils::parseAngle', () => {
  it('should parse radians angles', () => {
    const values = {
      '0': 0,
      '1.72': 1.72,
      '-2.56': Math.PI * 2 - 2.56,
      '3.14rad': 3.14,
      '-3.14rad': Math.PI * 2 - 3.14
    };

    for (const pos in values) {
      assert.strictEqual(utils.parseAngle(pos).toFixed(16), values[pos].toFixed(16), pos);
    }
  });

  it('should parse degrees angles', () => {
    const values = {
      '0deg': 0,
      '30deg': 30 * Math.PI / 180,
      '-30deg': Math.PI * 2 - 30 * Math.PI / 180,
      '85degs': 85 * Math.PI / 180,
      '360degs': 0
    };

    for (const pos in values) {
      assert.strictEqual(utils.parseAngle(pos).toFixed(16), values[pos].toFixed(16), pos);
    }
  });

  it('should normalize angles between 0 and 2Pi', () => {
    const values = {
      '450deg': Math.PI / 2,
      '1440deg': 0,
      '8.15': 8.15 - Math.PI * 2,
      '-3.14': Math.PI * 2 - 3.14,
      '-360deg': 0
    };

    for (const pos in values) {
      assert.strictEqual(utils.parseAngle(pos).toFixed(16), values[pos].toFixed(16), pos);
    }
  });

  it('should normalize angles between -Pi/2 and Pi/2', () => {
    const values = {
      '45deg': Math.PI / 4,
      '-4': Math.PI / 2
    };

    for (const pos in values) {
      assert.strictEqual(utils.parseAngle(pos, true).toFixed(16), values[pos].toFixed(16), pos);
    }
  });

  it('should throw exception on invalid values', () => {
    assert.throws(() => {
      utils.parseAngle('foobar');
    }, /unknown angle "foobar"/, 'foobar');

    assert.throws(() => {
      utils.parseAngle('200gr')
    }, /unknown angle unit "gr"/, '200gr');
  });
});


describe('utils::parsePosition', () => {
  it('should parse 2 keywords', () => {
    const values = {
      'top left': { left: 0, top: 0 },
      'top center': { left: 0.5, top: 0 },
      'top right': { left: 1, top: 0 },
      'center left': { left: 0, top: 0.5 },
      'center center': { left: 0.5, top: 0.5 },
      'center right': { left: 1, top: 0.5 },
      'bottom left': { left: 0, top: 1 },
      'bottom center': { left: 0.5, top: 1 },
      'bottom right': { left: 1, top: 1 }
    };

    for (const pos in values) {
      assert.deepStrictEqual(utils.parsePosition(pos), values[pos], pos);

      const rev = pos.split(' ').reverse().join(' ');
      assert.deepStrictEqual(utils.parsePosition(rev), values[pos], rev);
    }
  });

  it('should parse 1 keyword', () => {
    const values = {
      'top': { left: 0.5, top: 0 },
      'center': { left: 0.5, top: 0.5 },
      'bottom': { left: 0.5, top: 1 },
      'left': { left: 0, top: 0.5 },
      'right': { left: 1, top: 0.5 },
    };

    for (const pos in values) {
      assert.deepStrictEqual(utils.parsePosition(pos), values[pos], pos);
    }
  });

  it('should parse 2 percentages', () => {
    const values = {
      '0% 0%': { left: 0, top: 0 },
      '50% 50%': { left: 0.5, top: 0.5 },
      '100% 100%': { left: 1, top: 1 },
      '10% 80%': { left: 0.1, top: 0.8 },
      '80% 10%': { left: 0.8, top: 0.1 }
    };

    for (const pos in values) {
      assert.deepStrictEqual(utils.parsePosition(pos), values[pos], pos);
    }
  });

  it('should parse 1 percentage', () => {
    const values = {
      '0%': { left: 0, top: 0 },
      '50%': { left: 0.5, top: 0.5 },
      '100%': { left: 1, top: 1 },
      '80%': { left: 0.8, top: 0.8 }
    };

    for (const pos in values) {
      assert.deepStrictEqual(utils.parsePosition(pos), values[pos], pos);
    }
  });

  it('should parse mixed keyword & percentage', () => {
    const values = {
      'top 80%': { left: 0.8, top: 0 },
      '80% bottom': { left: 0.8, top: 1 },
      'left 40%': { left: 0, top: 0.4 },
      '40% right': { left: 1, top: 0.4 },
      'center 10%': { left: 0.5, top: 0.1 },
      '10% center': { left: 0.1, top: 0.5 }
    };

    for (const pos in values) {
      assert.deepStrictEqual(utils.parsePosition(pos), values[pos], pos);
    }
  });

  it('should fallback on parse fail', () => {
    const values = {
      '': { left: 0.5, top: 0.5 },
      'crap': { left: 0.5, top: 0.5 },
      'foo bar': { left: 0.5, top: 0.5 },
      'foo 50%': { left: 0.5, top: 0.5 },
      '%': { left: 0.5, top: 0.5 }
    };

    for (const pos in values) {
      assert.deepStrictEqual(utils.parsePosition(pos), values[pos], pos);
    }
  });

  it('should ignore extra tokens', () => {
    const values = {
      'top center bottom': { left: 0.5, top: 0 },
      '50% left 20%': { left: 0, top: 0.5 },
      '0% 0% okay this time it goes ridiculous': { left: 0, top: 0 }
    };

    for (const pos in values) {
      assert.deepStrictEqual(utils.parsePosition(pos), values[pos], pos);
    }
  });

  it('should ignore case', () => {
    const values = {
      'TOP CENTER': { left: 0.5, top: 0 },
      'cenTer LefT': { left: 0, top: 0.5 }
    };

    for (const pos in values) {
      assert.deepStrictEqual(utils.parsePosition(pos), values[pos], pos);
    }
  });
});


describe('utils::parseSpeed', () => {
  it('should parse all units', () => {
    const values = {
      '360dpm': 360 * Math.PI / 180 / 60,
      '360degrees per minute': 360 * Math.PI / 180 / 60,
      '10dps': 10 * Math.PI / 180,
      '10degrees per second': 10 * Math.PI / 180,
      '2radians per minute': 2 / 60,
      '0.1radians per second': 0.1,
      '2rpm': 2 * 2 * Math.PI / 60,
      '2revolutions per minute': 2 * 2 * Math.PI / 60,
      '0.01rps': 0.01 * 2 * Math.PI,
      '0.01revolutions per second': 0.01 * 2 * Math.PI
    };

    for (const speed in values) {
      assert.strictEqual(utils.parseSpeed(speed).toFixed(16), values[speed].toFixed(16), speed);
    }
  });

  it('should allow various forms', () => {
    const values = {
      '2rpm': 2 * 2 * Math.PI / 60,
      '2 rpm': 2 * 2 * Math.PI / 60,
      '2revolutions per minute': 2 * 2 * Math.PI / 60,
      '2 revolutions per minute': 2 * 2 * Math.PI / 60,
      '-2rpm': -2 * 2 * Math.PI / 60,
      '-2 rpm': -2 * 2 * Math.PI / 60,
      '-2revolutions per minute': -2 * 2 * Math.PI / 60,
      '-2 revolutions per minute': -2 * 2 * Math.PI / 60
    };

    for (const speed in values) {
      assert.strictEqual(utils.parseSpeed(speed).toFixed(16), values[speed].toFixed(16), speed);
    }
  });

  it('should throw exception on invalid unit', () => {
    assert.throws(() => {
      utils.parseSpeed('10rpsec');
    }, /unknown speed unit "rpsec"/, '10rpsec');
  });

  it('should passthrough when number', () => {
    assert.strictEqual(utils.parseSpeed(Math.PI), Math.PI);
  });
});

describe('utils::deepmerge', () => {
  it('should merge basic plain objects', () => {
    const one = { a: 'z', b: { c: { d: 'e' } } };
    const two = { b: { c: { f: 'g', j: 'i' } } };

    const result = utils.deepmerge(one, two);

    assert.deepStrictEqual(one, { a: 'z', b: { c: { d: 'e', f: 'g', j: 'i' } } });
    assert.strictEqual(result, one);
  });

  it('should merge arrays by replace', () => {
    const one = { a: [1, 2, 3] };
    const two = { a: [2, 4] };

    const result = utils.deepmerge(one, two);

    assert.deepStrictEqual(one, { a: [2, 4] });
    assert.strictEqual(result, one);
  });

  it('should clone object', () => {
    const one = { b: { c: { d: 'e' } } };

    const result = utils.deepmerge(null, one);

    assert.deepStrictEqual(result, { b: { c: { d: 'e' } } });
    assert.notStrictEqual(result, one);
    assert.notStrictEqual(result.b.c, one.b.c);
  });

  it('should clone array', () => {
    const one = [{ a: 'b' }, { c: 'd' }];

    const result = utils.deepmerge(null, one);

    assert.deepStrictEqual(result, [{ a: 'b' }, { c: 'd' }]);
    assert.notStrictEqual(result[0], one[1]);
  });

  it('should accept primitives', () => {
    const one = 'foo';
    const two = 'bar';

    const result = utils.deepmerge(one, two);

    assert.strictEqual(result, 'bar');
  });

  it('should stop on recursion', () => {
    const one = { a: 'foo' };
    one.b = one;

    const result = utils.deepmerge(null, one);

    assert.deepStrictEqual(result, { a: 'foo' });
  });
});

describe('utils::getXMPValue', () => {
  it('should parse XMP data with children', () => {
    const data = '<rdf:Description rdf:about="" xmlns:GPano="http://ns.google.com/photos/1.0/panorama/">\
      <GPano:ProjectionType>equirectangular</GPano:ProjectionType>\
      <GPano:UsePanoramaViewer>True</GPano:UsePanoramaViewer>\
      <GPano:CroppedAreaImageWidthPixels>5376</GPano:CroppedAreaImageWidthPixels>\
      <GPano:CroppedAreaImageHeightPixels>2688</GPano:CroppedAreaImageHeightPixels>\
      <GPano:FullPanoWidthPixels>5376</GPano:FullPanoWidthPixels>\
      <GPano:FullPanoHeightPixels>2688</GPano:FullPanoHeightPixels>\
      <GPano:CroppedAreaLeftPixels>0</GPano:CroppedAreaLeftPixels>\
      <GPano:CroppedAreaTopPixels>0</GPano:CroppedAreaTopPixels>\
      <GPano:PoseHeadingDegrees>270.0</GPano:PoseHeadingDegrees>\
      <GPano:PosePitchDegrees>0</GPano:PosePitchDegrees>\
      <GPano:PoseRollDegrees>0.2</GPano:PoseRollDegrees>\
    </rdf:Description>';

    assert.deepStrictEqual([
      utils.getXMPValue(data, 'FullPanoWidthPixels'),
      utils.getXMPValue(data, 'FullPanoHeightPixels'),
      utils.getXMPValue(data, 'CroppedAreaImageWidthPixels'),
      utils.getXMPValue(data, 'CroppedAreaImageHeightPixels'),
      utils.getXMPValue(data, 'CroppedAreaLeftPixels'),
      utils.getXMPValue(data, 'CroppedAreaTopPixels')
    ], [
      '5376', '2688', '5376', '2688', '0', '0'
    ])
  });

  it('should parse XMP data with attributes', () => {
    const data = '<rdf:Description rdf:about="" xmlns:GPano="http://ns.google.com/photos/1.0/panorama/"\
      GPano:ProjectionType="equirectangular"\
      GPano:UsePanoramaViewer="True"\
      GPano:CroppedAreaImageWidthPixels="5376"\
      GPano:CroppedAreaImageHeightPixels="2688"\
      GPano:FullPanoWidthPixels="5376"\
      GPano:FullPanoHeightPixels="2688"\
      GPano:CroppedAreaLeftPixels="0"\
      GPano:CroppedAreaTopPixels="0"\
      GPano:PoseHeadingDegrees="270"\
      GPano:PosePitchDegrees="0"\
      GPano:PoseRollDegrees="0"/>';

    assert.deepStrictEqual([
      utils.getXMPValue(data, 'FullPanoWidthPixels'),
      utils.getXMPValue(data, 'FullPanoHeightPixels'),
      utils.getXMPValue(data, 'CroppedAreaImageWidthPixels'),
      utils.getXMPValue(data, 'CroppedAreaImageHeightPixels'),
      utils.getXMPValue(data, 'CroppedAreaLeftPixels'),
      utils.getXMPValue(data, 'CroppedAreaTopPixels')
    ], [
      '5376', '2688', '5376', '2688', '0', '0'
    ])
  });

});

describe('utils::dasherize', () => {
  it('should dasherize from camelCase', () => {
    assert.strictEqual(utils.dasherize('strokeWidth'), 'stroke-width');
  });

  it('should not change existing dash-case', () => {
    assert.strictEqual(utils.dasherize('stroke-width'), 'stroke-width');
  });
});

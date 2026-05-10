import { describe, it, expect } from '@rstest/core';
import { render } from '../../src/shared/template.js';

describe('render', () => {
  it('replaces every {{KEY}} occurrence', () => {
    expect(render('Hello {{NAME}}, welcome to {{NAME}}.', { NAME: 'Wang' }))
      .toBe('Hello Wang, welcome to Wang.');
  });

  it('leaves unmapped placeholders as-is', () => {
    expect(render('{{A}} {{B}}', { A: 'x' })).toBe('x {{B}}');
  });

  it('returns the template unchanged when mapping is empty', () => {
    expect(render('no placeholders here', {})).toBe('no placeholders here');
  });

  it('handles multi-line templates', () => {
    expect(render('line1: {{X}}\nline2: {{X}}', { X: 'a' }))
      .toBe('line1: a\nline2: a');
  });

  it('does NOT recursively expand values', () => {
    expect(render('{{A}}', { A: '{{B}}', B: 'should-not-appear' })).toBe('{{B}}');
  });
});

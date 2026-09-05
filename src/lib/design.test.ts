import { describe, expect, it, vi, afterEach } from 'vitest';
import { buildInquiry, defaultDesign, loadDesign, parseDesign, saveDesign, selectProduct, whatsappUrl } from './design';

afterEach(() => vi.unstubAllGlobals());
describe('saved designs', () => {
  it('restores a valid direction without unexpected properties', () => {
    expect(parseDesign(JSON.stringify({ ...defaultDesign, unexpected: 'ignored' }))).toEqual(defaultDesign);
  });
  it.each([null, '', '{', 'null', '[]', '{"product":"__proto__"}', JSON.stringify({ ...defaultDesign, width: 500 }), JSON.stringify({ ...defaultDesign, fabric: 'invalid' }), JSON.stringify({ ...defaultDesign, width: '240' })])('rejects corrupt or unsupported preferences: %s', raw => expect(parseDesign(raw)).toBeNull());
  it('resets width to the new piece size', () => expect(selectProduct(defaultDesign, 'chair').width).toBe(84));
  it('keeps the app usable when storage access is denied', () => {
    vi.stubGlobal('localStorage', { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } });
    expect(loadDesign()).toBeNull(); expect(saveDesign(defaultDesign)).toBe(false);
  });
});
describe('consultation message', () => {
  const inquiry = { name: 'Asha', category: 'Living room', roomSize: '12 × 14 ft', notes: 'Can we use a washable fabric?', includeDesign: true };
  it('includes selected dimensions, finishes, and customer notes', () => {
    const message = buildInquiry({ ...defaultDesign, width: 220, fabric: 'teal' }, inquiry);
    expect(message).toContain('220 cm'); expect(message).toContain('Deep teal'); expect(message).toContain(inquiry.notes);
    expect(new URL(whatsappUrl(message)).searchParams.get('text')).toBe(message);
    expect(new URL(whatsappUrl(message)).pathname).toBe('/8801960481983');
  });
  it('does not attach an unrelated sofa design to a bedroom inquiry', () => expect(buildInquiry(defaultDesign, { ...inquiry, category: 'Bedroom', includeDesign: false })).not.toContain('sofa'));
  it('does not offer upholstery on a table', () => expect(buildInquiry(selectProduct(defaultDesign, 'table'), inquiry)).not.toContain('upholstery'));
});

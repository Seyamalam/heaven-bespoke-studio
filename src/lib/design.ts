export const furniture = {
  sofa: { name: 'The Sunday sofa', short: 'Sofa', subtitle: 'A softer place to land.', width: 240, min: 180, max: 300, depth: 100, height: 93, upholstered: true },
  chair: { name: 'The Pause chair', short: 'Lounge chair', subtitle: 'Your own quiet corner.', width: 84, min: 70, max: 100, depth: 79, height: 91, upholstered: true },
  table: { name: 'The Gather table', short: 'Coffee table', subtitle: 'At the heart of the room.', width: 120, min: 80, max: 160, depth: 73, height: 44, upholstered: false },
} as const;
export type FurnitureKey = keyof typeof furniture;
export const fabrics = {
  olive: { name: 'Soft olive', color: '#878b6c', description: 'Quiet, earthy, easy to live with.' },
  oatmeal: { name: 'Oatmeal', color: '#c7bca5', description: 'A warm neutral with a natural feel.' },
  terracotta: { name: 'Clay', color: '#ac7460', description: 'A little warmth. A lot of character.' },
  teal: { name: 'Deep teal', color: '#345b54', description: 'Rich color, a beautifully calm presence.' },
} as const;
export const woods = {
  walnut: { name: 'Walnut tone', color: '#64432b' },
  oak: { name: 'Natural oak tone', color: '#b29160' },
  smoked: { name: 'Smoked wood tone', color: '#39312b' },
} as const;
export type Design = { product: FurnitureKey; fabric: keyof typeof fabrics; wood: keyof typeof woods; width: number };
export const defaultDesign: Design = { product: 'sofa', fabric: 'olive', wood: 'walnut', width: 240 };
export const storageKey = 'heaven-design-v1';
export const rooms = [
  { id: 'living', name: 'Living', label: 'Room to slow down.', description: 'For long conversations, slow Sundays, and everything in between.', image: '/images/living.webp', alt: 'Concept living room with a linen sofa, walnut coffee table and lounge chair', category: 'Living room' },
  { id: 'bedroom', name: 'Bedroom', label: 'Your everyday retreat.', description: 'Soft textures and thoughtful details. A space that feels entirely yours.', image: '/images/bedroom.webp', alt: 'Concept bedroom with a bespoke upholstered bed and walnut bedside tables', category: 'Bedroom' },
  { id: 'dining', name: 'Dining', label: 'Made for gathering.', description: 'A place for shared meals, familiar faces, and one more cup of tea.', image: '/images/dining.webp', alt: 'Concept dining room with an oval walnut table and upholstered chairs', category: 'Dining room' },
] as const;
export type RoomKey = typeof rooms[number]['id'];
export function selectProduct(design: Design, product: FurnitureKey): Design {
  return { ...design, product, width: furniture[product].width };
}
export function parseDesign(raw: string | null): Design | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const d = value as Record<string, unknown>;
    if (typeof d.product !== 'string' || !Object.hasOwn(furniture, d.product) || typeof d.fabric !== 'string' || !Object.hasOwn(fabrics, d.fabric) || typeof d.wood !== 'string' || !Object.hasOwn(woods, d.wood)) return null;
    const product = d.product as FurnitureKey;
    if (typeof d.width !== 'number' || !Number.isFinite(d.width) || d.width < furniture[product].min || d.width > furniture[product].max) return null;
    return { product, fabric: d.fabric as Design['fabric'], wood: d.wood as Design['wood'], width: Math.round(d.width) };
  } catch { return null; }
}
export function loadDesign(): Design | null {
  try { return parseDesign(localStorage.getItem(storageKey)); } catch { return null; }
}
export function saveDesign(design: Design): boolean {
  try { localStorage.setItem(storageKey, JSON.stringify(design)); return true; } catch { return false; }
}
export type Inquiry = { name: string; category: string; roomSize: string; notes: string; includeDesign: boolean };
export function buildInquiry(design: Design, inquiry: Inquiry): string {
  const piece = furniture[design.product];
  return [
    `Hello Heaven Furniture Mart! I'm ${inquiry.name.trim() || 'interested in a consultation'}.`,
    `I'd like a free design consultation for my ${inquiry.category.toLowerCase()}.`,
    inquiry.includeDesign ? `My illustrative design direction: ${piece.name}, ${design.width} cm wide${piece.upholstered ? `, ${fabrics[design.fabric].name} upholstery` : ''}, ${woods[design.wood].name}.` : '',
    inquiry.roomSize.trim() ? `Approximate space: ${inquiry.roomSize.trim()}.` : '',
    inquiry.notes.trim() ? `Notes: ${inquiry.notes.trim()}` : '',
    'Please help me confirm materials, dimensions, availability, and a quote.',
  ].filter(Boolean).join('\n\n');
}
export function whatsappUrl(message: string): string {
  return `https://wa.me/8801960481983?text=${encodeURIComponent(message)}`;
}

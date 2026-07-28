export function catId(cat: { _id: string } | string) {
  return typeof cat === 'string' ? cat : cat._id;
}

export function namedRefName(ref: { name: string } | string | undefined) {
  if (!ref) return '';
  return typeof ref === 'string' ? ref : ref.name;
}

export function primaryImage(images?: Array<{ url: string; isPrimary?: boolean }>, fallback?: string) {
  if (!images?.length) return fallback;
  return images.find((i) => i.isPrimary)?.url ?? images[0]?.url ?? fallback;
}

export function ageLabel(months: number) {
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem ? `${years}y ${rem}mo` : `${years} yr`;
}

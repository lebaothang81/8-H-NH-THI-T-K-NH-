export const config = { runtime: 'edge' };

const MAX_BYTES = 10 * 1024 * 1024;
const CONDITIONS = {
  auto: 'Infer the visible home condition from the reference image and preserve it faithfully.',
  new: 'The home is new and well-maintained. Keep it new, clean, and polished without changing its architectural style.',
  used: 'The home is lived-in and in ordinary maintained condition. Preserve realistic signs of use; do not make it look newly renovated.',
  old: 'The home is old and visibly aged. Preserve its aged, worn condition and existing style; do not beautify it into a new home.'
};

export default async function handler(req) {
  const json = (payload, status = 200) => Response.json(payload, { status });
  if (req.method !== 'POST') return json({ error: 'Chỉ hỗ trợ POST.' }, 405);
  if (!process.env.OPENAI_API_KEY) return json({ error: 'Máy chủ chưa cấu hình OPENAI_API_KEY.' }, 503);
  try {
    const form = await req.formData();
    const image = form.get('image');
    if (!image || typeof image.arrayBuffer !== 'function') return json({ error: 'Thiếu ảnh đầu vào.' }, 400);
    if (image.size > MAX_BYTES) return json({ error: 'Ảnh vượt quá 10 MB.' }, 413);
    const allowed = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
    if (!allowed[image.type]) return json({ error: 'Định dạng ảnh chưa được hỗ trợ.' }, 400);
    let rooms;
    try { rooms = JSON.parse(form.get('rooms') || '[]'); } catch { rooms = []; }
    if (!Array.isArray(rooms) || rooms.length !== 8 || rooms.some(x => typeof x !== 'string' || x.length > 60)) {
      return json({ error: 'Cần chọn đúng 8 khu vực.' }, 400);
    }
    const condition = CONDITIONS[form.get('condition')] || CONDITIONS.auto;
    const source = new File([await image.arrayBuffer()], `reference.${allowed[image.type]}`, { type: image.type });
    const images = [];
    // Sequential generation keeps request bursts and provider rate limits under control.
    for (const room of rooms) {
      const prompt = `Create one photorealistic real-estate interior/exterior photograph showing the ${room} of the same home represented by the reference image. Treat the reference as the source of truth for architectural style, materials, dominant colors, ornament, lighting character, and age/condition. ${condition} Continue the same design language naturally in this different area. Make this a distinct useful camera view, not a collage, and do not copy the source composition. Do not add text, labels, watermarks, or redesign the home into another style. If the requested room is not visible in the reference, create a plausible illustrative room consistent with the reference and do not imply it is a documentary photograph.`;
      const payload = new FormData();
      payload.append('model', 'gpt-image-1');
      payload.append('image', source);
      payload.append('prompt', prompt);
      payload.append('size', '1024x1024');
      payload.append('quality', 'medium');
      payload.append('input_fidelity', 'high');
      const response = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: payload
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'Dịch vụ tạo ảnh gặp lỗi.');
      if (!result.data?.[0]?.b64_json) throw new Error('AI không trả về ảnh.');
      images.push({ room, b64: result.data[0].b64_json });
    }
    return json({ images });
  } catch (error) {
    return json({ error: error.message || 'Không thể tạo ảnh lúc này.' }, 500);
  }
}


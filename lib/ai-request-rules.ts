/** Request-size controls, not token estimates or a monetary quota. */
export const AI_REQUEST_LIMITS = { systemBytes: 16384, textBytes: 65536, contentBlocks: 3, mediaBlocks: 1, encodedMediaBytes: 12 * 1024 * 1024, bodyBytes: 13 * 1024 * 1024, outputTokens: 6000 } as const;
export const SUPPORTED_AI_MODELS = ['claude-sonnet-5-5', 'claude-haiku-5-5'] as const;
export const isSupportedAiModel = (name: string): boolean => (SUPPORTED_AI_MODELS as readonly string[]).includes(name);
const bytes = (text: string) => new TextEncoder().encode(text).byteLength;
const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const only = (value: Record<string, unknown>, keys: string[]) => Object.keys(value).every(key => keys.includes(key));
export type BoundedAiRequest = {
    ok: true;
    body: string;
} | {
    ok: false;
    reason: 'model' | 'output' | 'system' | 'content' | 'media' | 'size';
};
export function boundedAiRequest(system: string, prompt: string | unknown[], maxTokens: number, model: string): BoundedAiRequest {
    try {
        if (!isSupportedAiModel(model))
            return { ok: false, reason: 'model' };
        if (!Number.isSafeInteger(maxTokens) || maxTokens < 1 || maxTokens > AI_REQUEST_LIMITS.outputTokens)
            return { ok: false, reason: 'output' };
        if (typeof system !== 'string' || system.length > AI_REQUEST_LIMITS.systemBytes || bytes(system) > AI_REQUEST_LIMITS.systemBytes)
            return { ok: false, reason: 'system' };
        let textBytes = 0, media = 0;
        let content: string | unknown[] = prompt;
        if (typeof prompt === 'string') {
            if (prompt.length > AI_REQUEST_LIMITS.textBytes)
                return { ok: false, reason: 'size' };
            textBytes = bytes(prompt);
        }
        else {
            if (!Array.isArray(prompt) || prompt.length < 1 || prompt.length > AI_REQUEST_LIMITS.contentBlocks)
                return { ok: false, reason: 'content' };
            const clean: unknown[] = [];
            content = clean;
            for (const block of prompt) {
                if (!record(block))
                    return { ok: false, reason: 'content' };
                const kind = block.type;
                if (kind === 'text') {
                    const text = block.text;
                    if (!only(block, ['type', 'text']) || typeof text !== 'string')
                        return { ok: false, reason: 'content' };
                    if (text.length > AI_REQUEST_LIMITS.textBytes)
                        return { ok: false, reason: 'size' };
                    textBytes += bytes(text);
                    clean.push({ type: kind, text });
                }
                else if (kind === 'image' || kind === 'document') {
                    if (!only(block, ['type', 'source']) || !record(block.source) || !only(block.source, ['type', 'media_type', 'data']))
                        return { ok: false, reason: 'media' };
                    const source = block.source;
                    const data = source.data, mediaType = source.media_type, sourceType = source.type;
                    if (sourceType !== 'base64' || typeof data !== 'string' || data.length < 4 || data.length > AI_REQUEST_LIMITS.encodedMediaBytes || data.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(data))
                        return { ok: false, reason: 'media' };
                    const formats = kind === 'image' ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] : ['application/pdf'];
                    if (typeof mediaType !== 'string' || !formats.includes(mediaType) || ++media > AI_REQUEST_LIMITS.mediaBlocks)
                        return { ok: false, reason: 'media' };
                    clean.push({ type: kind, source: { type: 'base64', media_type: mediaType, data } });
                }
                else
                    return { ok: false, reason: 'content' };
            }
        }
        if (textBytes > AI_REQUEST_LIMITS.textBytes)
            return { ok: false, reason: 'size' };
        const body = JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: 'user', content }] });
        if (bytes(body) > AI_REQUEST_LIMITS.bodyBytes)
            return { ok: false, reason: 'size' };
        return { ok: true, body };
    }
    catch {
        return { ok: false, reason: 'content' };
    }
}

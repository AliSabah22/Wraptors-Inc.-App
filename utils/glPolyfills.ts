/**
 * Patches the global Blob constructor and URL.createObjectURL so that
 * Three.js's GLTFLoader can extract embedded textures from GLB files inside
 * React Native, where `new Blob([ArrayBuffer])` is not natively supported.
 *
 * Flow:
 *   GLTFLoader  →  new Blob([Uint8Array], { type })  →  URL.createObjectURL(blob)
 *   Our patch   →  stores raw bytes                  →  returns data:<type>;base64,…
 *   @expo/browser-polyfill HTMLImageElement then handles the data URI via expo-file-system.
 */

// WeakMap so GC can clean up fake blobs automatically
const _fakeBlobData = new WeakMap<object, { bytes: Uint8Array; type: string }>();

function hasBufferPart(parts: unknown[]): boolean {
  return parts.some((p) => p instanceof ArrayBuffer || ArrayBuffer.isView(p));
}

function collectBytes(parts: unknown[]): Uint8Array {
  const chunks: Uint8Array[] = parts.map((part) => {
    if (part instanceof ArrayBuffer) return new Uint8Array(part);
    if (ArrayBuffer.isView(part)) {
      const v = part as ArrayBufferView;
      return new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
    }
    if (typeof part === 'string') return new TextEncoder().encode(part);
    return new Uint8Array(0);
  });
  const total = chunks.reduce((n, c) => n + c.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}

function uint8ToBase64(bytes: Uint8Array): string {
  // Use btoa in chunks to avoid call-stack overflow on large buffers
  const CHUNK = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

let _patched = false;

export function patchBlobAndURL(): void {
  if (_patched) return;
  _patched = true;

  const NativeBlob = global.Blob as typeof Blob;
  const nativeCreateObjectURL =
    typeof URL !== 'undefined' ? (URL as { createObjectURL?: unknown }).createObjectURL : undefined;

  // Replace the global Blob with one that accepts ArrayBuffer/ArrayBufferView parts
  (global as unknown as { Blob: unknown }).Blob = function PatchedBlob(
    parts?: BlobPart[],
    options?: BlobPropertyBag,
  ) {
    if (parts && hasBufferPart(parts as unknown[])) {
      // Fake blob — store bytes and return a plain object
      const sentinel = Object.create(null) as object;
      _fakeBlobData.set(sentinel, {
        bytes: collectBytes(parts as unknown[]),
        type: options?.type ?? '',
      });
      return sentinel;
    }
    return new NativeBlob(parts, options);
  };

  // Patch URL.createObjectURL to convert fake blobs into data URIs
  (URL as unknown as Record<string, unknown>).createObjectURL = function patchedCreateObjectURL(
    blob: unknown,
  ) {
    const fake = _fakeBlobData.get(blob as object);
    if (fake) {
      const b64 = uint8ToBase64(fake.bytes);
      return `data:${fake.type};base64,${b64}`;
    }
    if (typeof nativeCreateObjectURL === 'function') {
      return (nativeCreateObjectURL as (b: unknown) => string)(blob);
    }
    throw new Error('URL.createObjectURL is not available');
  };
}

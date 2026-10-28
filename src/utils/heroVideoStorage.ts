// IndexedDB storage utility for persisting custom Hero background video files (.mp4, .webm, .mov)
// or external Google Drive / direct video URLs across page reloads.

const DB_NAME = 'gdsl_hero_media_db';
const STORE_NAME = 'hero_video_store';
const VIDEO_KEY = 'custom_hero_video';

export interface StoredHeroVideo {
  type: 'blob' | 'url' | 'gdrive';
  blob?: Blob;
  url?: string;
  driveFileId?: string;
  fileName?: string;
  updatedAt: number;
}

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveHeroVideoBlob(file: File): Promise<StoredHeroVideo> {
  const db = await openMediaDB();
  const record: StoredHeroVideo = {
    type: 'blob',
    blob: file,
    fileName: file.name,
    updatedAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record, VIDEO_KEY);
    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

export function extractGoogleDriveFileId(inputUrl: string): string | null {
  const trimmed = inputUrl.trim();
  // Match /file/d/<ID>
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) {
    return fileMatch[1];
  }
  // Match ?id=<ID> or &id=<ID>
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }
  return null;
}

export async function saveHeroVideoUrl(rawUrl: string): Promise<StoredHeroVideo> {
  const db = await openMediaDB();
  const driveFileId = extractGoogleDriveFileId(rawUrl);

  const record: StoredHeroVideo = driveFileId
    ? {
        type: 'gdrive',
        driveFileId,
        url: `https://drive.google.com/file/d/${driveFileId}/preview`,
        updatedAt: Date.now(),
      }
    : {
        type: 'url',
        url: rawUrl.trim(),
        updatedAt: Date.now(),
      };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record, VIDEO_KEY);
    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

export async function loadStoredHeroVideo(): Promise<StoredHeroVideo | null> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(VIDEO_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function clearStoredHeroVideo(): Promise<void> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(VIDEO_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore errors
  }
}

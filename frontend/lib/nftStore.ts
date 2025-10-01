// lib/nftStore.ts
export type StoredNFT = {
    id: string;
    content: string;
    createdAt: number;
    score?: number; // 结果页的分数（可选）
  };
  
  const KEY = 'mooncl_nfts';
  
  export function loadNFTs(): StoredNFT[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as StoredNFT[]) : [];
    } catch {
      return [];
    }
  }
  
  export function saveNFT(entry: Omit<StoredNFT, 'id' | 'createdAt'>): StoredNFT {
    const now = Date.now();
    const item: StoredNFT = { id: `nft_${now}`, createdAt: now, ...entry };
    const list = loadNFTs();
    list.unshift(item);
    localStorage.setItem(KEY, JSON.stringify(list));
    return item;
  }
  
  export function updateNFTScore(id: string, score: number) {
    const list = loadNFTs();
    const idx = list.findIndex((x) => x.id === id);
    if (idx >= 0) {
      list[idx].score = score;
      localStorage.setItem(KEY, JSON.stringify(list));
    }
  }
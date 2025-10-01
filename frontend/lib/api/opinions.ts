import { getJSON } from '../http';
import { PASEO_PASSET_HUB_CHAIN_ID } from '@/lib/api.stubs';

export type OpinionDTO = {
  token_id: number;
  owner_address: string;
  content: string;
  evaluate_price: number;
  current_price: number;
  created_at: string;
};

export type OpinionItem = {
  token_id: number;
  title: string;     // 列表中部显示（用 content 做标题）
  current_price: number;     // evaluate_price
  owner_address: string;     // address
  content: string;   // 详情/tooltip 可复用
};

export async function getOpinionsRanking(
  params: { sort_by?: 'price' | 'recent'; limit?: number; offset?: number; chainId?: number } = {}
): Promise<OpinionItem[]> {
  const q = new URLSearchParams();
  if (params.sort_by) q.set('sort_by', params.sort_by);
  if (params.limit != null) q.set('limit', String(params.limit));
  if (params.offset != null) q.set('offset', String(params.offset));

  const path =
    params.chainId === PASEO_PASSET_HUB_CHAIN_ID
      ? '/api/v1/nfts/polkadot/ranking'
      : '/api/v1/nfts/ranking';

  const list = await getJSON<OpinionDTO[]>(
    `${path}${q.toString() ? `?${q.toString()}` : ''}`
  );

  return list.map((d) => ({
    token_id: d.token_id,
    title: d.content || `Opinion #${d.token_id}`,
    current_price: Number(d.current_price ?? 0),
    owner_address: d.owner_address || 'unknown',
    content: d.content || '',
  }));
}

export type OpinionDetail = {
    token_id: number;
    owner_address: string;
    content: string;
    evaluate_price: number;
    current_price: number;
    created_at: string;
    updated_at: string | null;
  };
  
  export async function getOpinionDetail(token_id: string | number, opts?: { chainId?: number }): Promise<OpinionDetail> {
    const base = process.env.NEXT_PUBLIC_API_BASE;
    if (!base) throw new Error('NEXT_PUBLIC_API_BASE is not set');

    const path =
      opts?.chainId === PASEO_PASSET_HUB_CHAIN_ID
        ? `/api/v1/nfts/polkadot/detail/${token_id}`
        : `/api/v1/nfts/detail/${token_id}`;

    const res = await fetch(`${base}${path}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // 需要凭证的话在这里补上 Authorization
    });
  
    if (!res.ok) {
      if (res.status === 404) throw new Error('Opinion not found');
      throw new Error(`Failed to fetch detail: ${res.status}`);
    }
  
    const data = (await res.json()) as OpinionDetail;
    return data;
  }

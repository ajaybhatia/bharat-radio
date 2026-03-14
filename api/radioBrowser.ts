import { Station } from '../store/playerStore';

const BASE_URL = 'https://all.api.radio-browser.info/json';

export const fetchStations = async (options: { 
  offset?: number; 
  limit?: number; 
  country?: string; 
  state?: string; 
  tag?: string;
  name?: string;
} = {}): Promise<Station[]> => {
  const { offset = 0, limit = 50, country, state, tag, name } = options;
  
  let endpoint = `${BASE_URL}/stations/search?limit=${limit}&offset=${offset}&hidebroken=true&order=votes&reverse=true`;
  
  if (country) endpoint += `&country=${country}`;
  if (state) endpoint += `&state=${state}`;
  if (tag) endpoint += `&tag=${tag}`;
  if (name) endpoint += `&name=${name}`;

  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    
    return data.map((item: any) => ({
      id: item.stationuuid,
      name: item.name,
      url: item.url_resolved || item.url,
      favicon: item.favicon,
      tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [],
      state: item.state,
      language: item.language,
    }));
  } catch (error) {
    console.error('Error fetching stations:', error);
    return [];
  }
};

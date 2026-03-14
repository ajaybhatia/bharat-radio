import { Station } from '../store/playerStore';

const BASE_URL = 'https://de1.api.radio-browser.info/json';

export const fetchStations = async (options: { offset?: number; limit?: number; country?: string; state?: string; tag?: string } = {}): Promise<Station[]> => {
  const { offset = 0, limit = 50, country = 'India', state, tag } = options;
  
  let endpoint = `${BASE_URL}/stations/search?limit=${limit}&offset=${offset}&country=${country}&hidebroken=true&order=votes&reverse=true`;
  
  if (state) endpoint += `&state=${state}`;
  if (tag) endpoint += `&tag=${tag}`;

  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    
    return data.map((item: any) => ({
      id: item.stationuuid,
      name: item.name,
      url: item.url_resolved || item.url,
      favicon: item.favicon,
      tags: item.tags ? item.tags.split(',') : [],
      state: item.state,
      language: item.language,
    }));
  } catch (error) {
    console.error('Error fetching stations:', error);
    return [];
  }
};

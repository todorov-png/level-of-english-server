import axios from 'axios';

class CRMService {
  async getAllOffers(bearer) {
    try {
      const answer = await axios.get(process.env.CRM_URL, {
        headers: {
          Authorization: `Bearer ${bearer}`,
          'Content-type': 'application/json',
        },
      });
      return answer.data || [];
    } catch {
      return null;
    }
  }
}

export default new CRMService();

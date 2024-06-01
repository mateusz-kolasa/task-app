import axios, { AxiosInstance } from 'axios';

class Request {
  private http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: '/api',
      withCredentials: true,
    });
  }

  get(url: string, config = {}) {
    return this.http.get(url, config);
  }

  post(url: string, data = {}, config = {}) {
    return this.http.post(url, data, config);
  }

  delete(url: string, config = {}) {
    return this.http.delete(url, config);
  }

  patch(url: string, data = {}, config = {}) {
    return this.http.patch(url, data, config);
  }
}

export default new Request();

import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api/';
const API_KEY = '12371278-ee82e7e687c0227bfbef9a885';

export class PixabayAPI {
  #page = 1;
  #query = '';
  #totalPages = 0;
  #per_page = 40;

  async getPhotos() {
    const params = {
      page: this.#page,
      q: this.#query,
      per_page: this.#per_page,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
    };

    const urlAXIOS = `?key=${API_KEY}&q=${this.#query}&page=${
      this.#page
    }&per_page=${this.#per_page}`;

    const { data } = await axios.get(urlAXIOS, {
      params,
    });
    return data;
  }

  get query() {
    return this.#query;
  }

  set query(newQuery) {
    this.#query = newQuery;
  }

  incrementPage() {
    this.#page += 1;
  }
  resetPage() {
    this.#page = 1;
  }
  setTotal(total) {
    this.#totalPages = total;
  }
  hasMorePhotos() {
    return this.#page < Math.ceil(this.#totalPages / this.#per_page);
  }
}

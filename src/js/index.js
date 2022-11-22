import { refs } from './refs';
import { PixabayAPI } from './PixabayAPI';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { createMarkup } from './createMarkup';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const modalLightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
});

refs.loadMore.classList.add('.is-hidden');

const pixabay = new PixabayAPI();

const options = {
  root: null,
  rootMargin: '100px',
  threshold: 1.0,
};

const loadMorePhotos = async function (entries, observer) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      observer.unobserve(entry.target);

      pixabay.incrementPage();

      try {
        const { hits } = await pixabay.getPhotos();
        const markup = createMarkup(hits);

        refs.list.insertAdjacentHTML('beforeend', markup);

        if (pixabay.hasMorePhotos) {
          const lastItem = document.querySelector('.gallery a:last-child');
          observer.observe(lastItem);
        } else
          Notify.info(
            "We're sorry, but you've reached the end of search results."
          );

        modalLightbox.refresh();

        scrollPage();
      } catch (error) {
        Notify.failure(error.message, 'Something went wrong!');
        clearPage();
      }
    }
  });
};

const observer = new IntersectionObserver(loadMorePhotos, options);

const handleSubmit = async event => {
  event.preventDefault();

  const {
    elements: { searchQuery },
  } = event.target;

  const search_query = searchQuery.value.trim().toLowerCase();

  if (!search_query) {
    clearPage();
    Notify.info('Enter data to search!');
    return;
  }

  pixabay.query = search_query;

  clearPage();

  try {
    const { hits, total } = await pixabay.getPhotos();
    if (hits.length === 0) {
      Notify.failure(
        `Sorry, there are no images matching your ${search_query}. Please try again.`
      );
      return;
    }

    const markup = createMarkup(hits);

    refs.list.insertAdjacentHTML('beforeend', markup);

    pixabay.setTotal(total);

    Notify.success(`Hooray! We found ${total} images.`);

    if (pixabay.hasMorePhotos) {
      const lastItem = document.querySelector('.gallery a:last-child');
      observer.observe(lastItem);
    }

    modalLightbox.refresh();
    scrollPage()
    
  } catch (error) {
    Notify.failure(error.message, 'Something went wrong!');
    clearPage();
  }
};

const onLoadMore = async () => {
  pixabay.incrementPage();

  if (!pixabay.hasMorePhotos) {
    refs.loadMore.classList.add('is-hidden');
    Notify.info("We're sorry, but you've reached the end of search results.");
  }
  try {
    const { hits } = await pixabay.getPhotos();

    const markup = createMarkup(hits);

    refs.list.insertAdjacentHTML('beforeend', markup);

    modalLightbox.refresh();

  } catch (error) {
    Notify.failure(error.message, 'Something went wrong!');

    clearPage();
  }
};

function scrollPage() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function clearPage() {
  pixabay.resetPage();
  refs.list.innerHTML = '';
  refs.loadMore.classList.add('is-hidden');
}

refs.form.addEventListener('submit', handleSubmit);
refs.loadMore.addEventListener('click', onLoadMore)
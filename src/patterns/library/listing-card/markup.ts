export const listingCardMarkup = `<article class="pattern-listing-card">
  <div class="pattern-listing-card__media">
    <img
      class="pattern-listing-card__image"
      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&amp;fit=crop&amp;w=1200&amp;q=85"
      alt="Modern lakeside house surrounded by trees"
      width="1200"
      height="800"
    >
    <img
      class="pattern-listing-card__image pattern-listing-card__image--blur"
      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&amp;fit=crop&amp;w=1200&amp;q=85"
      alt=""
      width="1200"
      height="800"
      aria-hidden="true"
    >
    <span class="pattern-listing-card__badge">Featured</span>
    <label class="pattern-listing-card__favorite">
      <input type="checkbox" aria-label="Save Lakeshore House">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z"/>
      </svg>
    </label>
  </div>

  <div class="pattern-listing-card__body">
    <header class="pattern-listing-card__header">
      <h3>Lakeshore House</h3>
      <span class="pattern-listing-card__rating" aria-label="Rated 4.8 out of 5">
        <span aria-hidden="true">★</span> 4.8
      </span>
    </header>
    <p class="pattern-listing-card__meta">3 bedrooms · 4 bathrooms</p>
    <footer class="pattern-listing-card__footer">
      <p class="pattern-listing-card__price"><strong>$250</strong> night</p>
      <a class="btn pattern-listing-card__action" href="/contact">Reserve</a>
    </footer>
  </div>
</article>`;

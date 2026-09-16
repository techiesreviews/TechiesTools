export const featureDirectoryMarkup = `<section class="feature-directory_component section layout-grid" aria-labelledby="feature-directory-title">
	<h2 id="feature-directory-title" class="heading-style-h2">Tools for the work ahead.</h2>
	<div class="layout layout-grid">
		<fieldset class="filters layout-grid min-inline-zero">
			<legend class="visually-hidden">Filter modules</legend>
			<label><input id="feature-directory-all" type="radio" name="feature-directory-filter" checked="">All</label><label><input id="feature-directory-plan" type="radio" name="feature-directory-filter">Plan</label><label><input id="feature-directory-build" type="radio" name="feature-directory-filter">Build</label><label><input id="feature-directory-share" type="radio" name="feature-directory-filter">Share</label></fieldset>
		<div class="results layout-grid">
			<article class="featured" data-kind="plan">
				<p class="text-style-small">Featured / Plan</p>
				<h3 class="heading-style-h3">Make each decision traceable.</h3>
				<a class="btn button_component" href="/framework/homepage">Open guidance</a></article>
			<ul class="layout-grid list-reset">
				<li data-kind="plan" class="layout-grid"><strong>Briefs</strong><span>Start with context.</span></li>
				<li data-kind="build" class="layout-grid"><strong>Patterns</strong><span>Compose repeatable sections.</span></li>
				<li data-kind="share" class="layout-grid"><strong>Exports</strong><span>Bring the system with you.</span></li>
				<li data-kind="plan" class="layout-grid"><strong>Tokens</strong><span>Keep preferences connected.</span></li>
				<li data-kind="build" class="layout-grid"><strong>Reviews</strong><span>Make decisions visible.</span></li>
				<li data-kind="share" class="layout-grid"><strong>Notes</strong><span>Give work useful language.</span></li>
			</ul>
		</div>
	</div>
</section>`;

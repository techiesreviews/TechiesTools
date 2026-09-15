export const featureDirectoryMarkup = `<section class="feature-directory" aria-labelledby="feature-directory-title">
	<h2 id="feature-directory-title">Tools for the work ahead.</h2>
	<div class="feature-directory__layout">
		<fieldset class="feature-directory__filters">
			<legend>Filter modules</legend>
			<label><input id="feature-directory-all" type="radio" name="feature-directory-filter" checked>All</label><label><input id="feature-directory-plan" type="radio" name="feature-directory-filter">Plan</label><label><input id="feature-directory-build" type="radio" name="feature-directory-filter">Build</label><label><input id="feature-directory-share" type="radio" name="feature-directory-filter">Share</label></fieldset>
		<div class="feature-directory__content">
			<article class="feature-directory__featured" data-kind="plan">
				<p>Featured / Plan</p>
				<h3>Make each decision traceable.</h3>
				<a class="btn" href="/framework/homepage">Open guidance</a></article>
			<ul>
				<li data-kind="plan"><strong>Briefs</strong><span>Start with context.</span></li>
				<li data-kind="build"><strong>Patterns</strong><span>Compose repeatable sections.</span></li>
				<li data-kind="share"><strong>Exports</strong><span>Bring the system with you.</span></li>
				<li data-kind="plan"><strong>Tokens</strong><span>Keep preferences connected.</span></li>
				<li data-kind="build"><strong>Reviews</strong><span>Make decisions visible.</span></li>
				<li data-kind="share"><strong>Notes</strong><span>Give work useful language.</span></li>
			</ul>
		</div>
	</div>
</section>`;

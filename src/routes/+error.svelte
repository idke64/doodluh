<script>
	import { page } from '$app/stores';
</script>

<div class="error-container">
	<h1>{$page.status}: {$page.error?.message || 'Error'}</h1>
	<p>Sorry, something went wrong.</p>
	<!-- <a href="/">Go back home</a> -->
</div>

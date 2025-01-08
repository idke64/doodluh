<script>
	import { page } from '$app/state';
	import ErrorPage from '$lib/components/ui/ErrorPage.svelte';
</script>

<ErrorPage status={page.status} errorMsg={page.error?.message} />

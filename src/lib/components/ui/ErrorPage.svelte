<script>
	let { errorMsg, status } = $props();
</script>

<div class="flex h-[100vh] w-full flex-col items-center justify-center gap-y-3">
	<div class="flex flex-col items-center">
		<h1>{status}</h1>
		<p class="text-lg">{errorMsg}</p>
	</div>
	<a href="/" class="link">Home</a>
</div>

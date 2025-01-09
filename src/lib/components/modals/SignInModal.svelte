<script>
	import Fa from 'svelte-fa';
	import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
	import { scale } from 'svelte/transition';
	import { Input } from '$lib/components';
</script>

<div
	class="pointer-events-auto w-[340px] translate-y-2 rounded bg-bg-2 p-8"
	transition:scale={{ duration: 300, start: 0.95 }}
>
	<div class="flex flex-col items-center justify-center gap-y-6">
		<div class="flex flex-col items-center justify-center gap-y-2 text-center">
			<h4>Sign In</h4>
			<p class="text-wrap">
				Sign in (or create an account) with one of the providers below to save your work across
				devices
			</p>
		</div>

		<div class="flex w-full flex-col items-center gap-y-2">
			<a
				class="btn-secondary flex h-8 w-full items-center justify-center gap-x-1.5"
				href="/api/auth/login/google"><Fa icon={faGoogle} />Continue with Google</a
			>
			<a class="btn-secondary w-full gap-x-1.5" href="/api/auth/login/github"
				><Fa icon={faGithub} />Continue with Github</a
			>
			<!-- <span class="mt-2 self-center text-sm font-medium text-text-3">or</span>
			<form class="flex w-full flex-col gap-y-3">
				<Input type="email" name="email" placeholder="example@email.com" label="Email" />
				<button class="btn-primary w-full">Submit</button>
			</form> -->
		</div>
	</div>
</div>

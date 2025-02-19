<script lang="ts">
	import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	let { scale = $bindable(), changeScale } = $props();
</script>

<div class="rounded bg-bg-2 p-1 shadow">
	<div class="flex items-center gap-x-4">
		<button
			class="btn-icon tooltip-top"
			style="--label: 'Zoom In'"
			onclick={() => changeScale(0.1)}
		>
			<Fa icon={faPlus} />
		</button>
		<button
			onclick={() => changeScale(1 - scale)}
			class="tooltip-top relative flex h-8 w-10 items-center justify-center text-text-3"
			style="--label: 'Reset'">{Math.round(scale * 100)}%</button
		>
		<button
			class="btn-icon tooltip-top"
			style="--label: 'Zoom Out'"
			onclick={() => changeScale(-0.1)}
		>
			<Fa icon={faMinus} />
		</button>
	</div>
</div>

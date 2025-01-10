<script>
	import { faRedo, faUndo } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	let { actions = $bindable(), actionsIndex = $bindable() } = $props();
</script>

<div class="rounded bg-bg-2 p-1 shadow">
	<div class="flex items-center">
		<button
			class="btn-icon tooltip-top"
			style="--label: 'Undo'"
			onclick={() => (actionsIndex = [Math.max(actionsIndex[0] - 1, -1), -1])}
			disabled={actionsIndex[0] == -1}
		>
			<Fa icon={faUndo} />
		</button>
		<button
			class="btn-icon tooltip-top"
			style="--label: 'Redo'"
			onclick={() => (actionsIndex = [Math.min(actionsIndex[0] + 1, actions.length - 1), 1])}
			disabled={actionsIndex[0] >= actions.length - 1}
		>
			<Fa icon={faRedo} />
		</button>
	</div>
</div>

<script lang="ts">
	import { App } from '$lib/components';
	import { localBoard, localCollaborators, localTempObjects } from '$lib/shared';
</script>

<App
	board={localBoard}
	collaborators={localCollaborators}
	tempObjects={localTempObjects}
	loading={localBoard.loading}
/>

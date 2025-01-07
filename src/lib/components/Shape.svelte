<script>
	let { shape, class: className = '' } = $props();
</script>

{#if shape === 'rectangle'}
	<svg viewBox="0 0 24 24" class={className} preserveAspectRatio="xMidYMid meet">
		<rect
			x="3"
			y="3"
			width="18"
			height="18"
			rx="2"
			ry="2"
			fill="none"
			stroke="currentColor"
			stroke-width="currentStrokeWidth"
		/>
	</svg>
{:else if shape === 'ellipse'}
	<svg viewBox="0 0 24 24" class={className} preserveAspectRatio="xMidYMid meet">
		<circle
			cx="12"
			cy="12"
			r="10"
			fill="none"
			stroke="currentColor"
			stroke-width="currentStrokeWidth"
		/>
	</svg>
{:else if shape === 'triangle'}
	<svg viewBox="0 0 24 24" class={className} preserveAspectRatio="xMidYMid meet">
		<polygon
			points="12,3 21.5,19.6 2.5,19.6"
			fill="none"
			stroke-linejoin="round"
			stroke-width="currentStrokeWidth"
			stroke="currentColor"
		/>
	</svg>
{:else if shape === 'rhombus'}
	<svg viewBox="0 0 24 24" class={className} preserveAspectRatio="xMidYMid meet">
		<polygon
			points="12,2 22,12 12,22 2,12"
			fill="none"
			stroke-linejoin="round"
			stroke="currentColor"
			stroke-width="currentStrokeWidth"
		/>
	</svg>
{:else if shape === 'star'}
	<svg viewBox="0 0 24 24" class={className} preserveAspectRatio="xMidYMid meet">
		<polygon
			points="12,2 15,8 22,9 17,14 18,22 12,18 6,22 7,14 2,9 9,8"
			fill="none"
			stroke-linejoin="round"
			stroke="currentColor"
			stroke-width="currentStrokeWidth"
		/>
	</svg>
{/if}

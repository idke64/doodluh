<script lang="ts">
	import {
		faChalkboard,
		faDownload,
		faHamburger,
		faKeyboard,
		faSun,
		faTerminal,
		faUser,
		faMoon,
		faRightFromBracket,
		faBorderAll,
		faBorderNone,
		faXmark,
		faCircleHalfStroke,
		faBorderTopLeft
	} from '@fortawesome/free-solid-svg-icons';

	import { onMount } from 'svelte';
	import Fa from 'svelte-fa';
	import { theme } from '$lib/shared';
	import { getContext } from 'svelte';
	import type { User } from '$lib/server/database/schema';
	import { scale } from 'svelte/transition';
	import { currModal } from '$lib/shared';
	import { ToggleSwitch } from '$lib/components';

	let { board } = $props();

	const user: User = getContext('user');

	let isOpen = $state(false);

	let dropdown: HTMLElement | null = $state(null);

	function handleClickOutside(e: MouseEvent) {
		if (dropdown && !dropdown.contains(e.target as Node) && isOpen) {
			isOpen = false;
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div bind:this={dropdown} class="relative">
	<button
		class="{isOpen ? 'btn-icon-active' : 'btn-icon'} rounded shadow"
		onclick={() => (isOpen = !isOpen)}
	>
		{#if user === null}
			<Fa class="text-text-3" icon={faHamburger} />
		{:else if user?.picture}
			<div class="aspect-square h-6 w-6 overflow-hidden rounded-sm">
				<img src={user.picture} alt="profile" class="h-full w-full" />
			</div>
		{:else}
			<Fa class="text-text-3" icon={faUser} />
		{/if}
	</button>
	{#if isOpen}
		<div
			class="{isOpen
				? 'origin-bottom scale-100 opacity-100'
				: 'pointer-events-none origin-top scale-95 opacity-0'} absolute right-0 top-[calc(100%+12px)] flex w-44 flex-col items-center rounded bg-bg-2 px-1.5 py-1.5 shadow duration-300"
			transition:scale={{ duration: 300, start: 0.95 }}
		>
			<div class="w-full">
				{#if user != null}
					<button class="btn-dropdown flex-col items-start">
						<span class="text-sm font-medium text-text-2">{user.name}</span>
						<span
							class="flex w-full justify-start overflow-hidden truncate text-ellipsis text-[10px] leading-3 text-text-3"
							>{user.email}
						</span>
					</button>
				{:else}
					<button
						class="btn-dropdown"
						onclick={() => {
							currModal.value = 'signin';
							isOpen = false;
						}}><Fa class="aspect-square" icon={faUser} />Sign In</button
					>
				{/if}
			</div>
			{#if user !== null}
				<div class="my-1 h-[0.5px] w-full bg-border"></div>
				<div class="w-full">
					<button
						class="btn-dropdown"
						onclick={() => {
							currModal.value = 'boards';
							isOpen = false;
						}}><Fa class="aspect-square" icon={faChalkboard} />Boards</button
					>
				</div>
			{/if}
			<div class="my-1 h-[0.5px] w-full bg-border"></div>
			<div class="w-full">
				<button class="btn-dropdown"><Fa class="aspect-square" icon={faDownload} />Export</button>
				<button class="btn-dropdown"><Fa class="aspect-square" icon={faTerminal} />Commands</button>
				<button class="btn-dropdown"><Fa class="aspect-square" icon={faKeyboard} />Keybinds</button>
			</div>
			<div class="my-1 h-[1px] w-full bg-border"></div>
			<div class="w-full">
				<div class="item-dropdown">
					<div class="flex items-center gap-x-2">
						<Fa class="aspect-square" icon={faBorderTopLeft} />
						<span>Grid</span>
					</div>
					<ToggleSwitch
						options={['lines', 'dots', 'none']}
						optionsIcons={[faBorderAll, faBorderNone, faXmark]}
						onupdate={(gridVal: 'lines' | 'dots' | 'none') => board.update({ grid: gridVal })}
						value={board.grid}
					/>
				</div>
			</div>
			<div class="w-full">
				<div class="item-dropdown">
					<div class="flex items-center gap-x-2">
						<Fa class="aspect-square" icon={faCircleHalfStroke} />
						<span>Theme</span>
					</div>

					<ToggleSwitch
						options={['dark', 'light']}
						optionsIcons={[faMoon, faSun]}
						onupdate={(themeVal: 'dark' | 'light') => {
							$theme = themeVal;
						}}
						value={$theme}
					/>
				</div>
			</div>
			{#if user != null}
				<div class="my-1 h-[0.5px] w-full bg-border"></div>
				<div class="w-full">
					<a class="btn-logout" href="/api/auth/logout"
						><Fa class="aspect-square" icon={faRightFromBracket} />Logout</a
					>
				</div>
			{/if}
		</div>
	{/if}
</div>

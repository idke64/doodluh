declare global {
	namespace App {
		interface Components {
			Toolbar: typeof import('../lib/components/Toolbar.svelte').default;
			Canvas: typeof import('../lib/components/Canvas.svelte').default;
			Menu: typeof import('../lib/components/Menu.svelte').default;
			ModalContainer: typeof import('../lib/components/modals/ModalContainer.svelte').default;
		}
		interface Stores {
			profile: typeof import('../lib/shared/stores/profile').default;
			canvasState: typeof import('../lib/shared/stores/canvasState').default;
			theme: typeof import('../lib/shared/stores/theme').default;
		}
		interface Locals {
			user: User | null;
			session: Session | null;
		}
	}
}
declare module '@fortawesome/pro-solid-svg-icons/index.es' {
	export * from '@fortawesome/pro-solid-svg-icons';
}
declare module '@fortawesome/pro-regular-svg-icons/index.es' {
	export * from '@fortawesome/pro-regular-svg-icons';
}

export {};

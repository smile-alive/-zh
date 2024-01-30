// @ts-ignore
import { FlowComponent } from 'solid-js';

type TransitionEvents = {
	/**
	 * 在进入过渡开始之前调用的函数。
	 * 此时 {@link element} 尚未呈现。
	 */
	onBeforeEnter?: (element: Element) => void;
	/**
	 * 在进入过渡开始时调用的函数。
	 * 此时 {@link element} 已呈现到 DOM 中。
	 *
	 * 调用 {@link done} 来结束过渡 - 移除进入类，并调用 {@link TransitionEvents.onAfterEnter}。
	 * 如果未提供 {@link done} 的参数，将在 `transitionend` 或 `animationend` 上调用它。
	 */
	onEnter?: (element: Element, done: () => void) => void;
	/**
	 * 在进入过渡结束后调用的函数。
	 * {@link element} 从 DOM 中移除。
	 */
	onAfterEnter?: (element: Element) => void;
	/**
	 * 在退出过渡开始之前调用的函数。
	 * 此时 {@link element} 仍然呈现，退出类尚未应用。
	 */
	onBeforeExit?: (element: Element) => void;
	/**
	 * 在退出过渡开始时调用的函数，在退出类被应用后调用
	 * ({@link TransitionProps.enterToClass} 和 {@link TransitionProps.exitActiveClass}）。
	 * 此时 {@link element} 仍然呈现。
	 *
	 * 调用 {@link done} 来结束过渡 - 移除退出类，调用 {@link TransitionEvents.onAfterExit}，
	 * 并从 DOM 中移除元素。
	 * 如果未提供 {@link done} 的参数，将在 `transitionend` 或 `animationend` 上调用它。
	 */
	onExit?: (element: Element, done: () => void) => void;
	/**
	 * 在退出过渡结束后调用的函数。
	 * {@link element} 从 DOM 中移除。
	 */
	onAfterExit?: (element: Element) => void;
};
/**
 * {@link Transition} 组件的属性。
 */
type TransitionProps = TransitionEvents & {
	/**
	 * 用于自动生成过渡 CSS 类名的前缀。
	 * 例如，`name: 'fade'` 将自动扩展为 `.fade-enter`、`.fade-enter-active` 等。
	 * 默认为 `"s"`。
	 */
	name?: string;
	/**
	 * 应用于整个进入过渡期间的进入元素的 CSS 类。
	 * 默认为 `"s-enter-active"`。
	 */
	enterActiveClass?: string;
	/**
	 * 在进入过渡开始时应用于进入元素的 CSS 类，且在一帧后移除。
	 * 默认为 `"s-enter"`。
	 */
	enterClass?: string;
	/**
	 * 在进入过渡开始后应用于进入元素的 CSS 类。
	 * 默认为 `"s-enter-to"`。
	 */
	enterToClass?: string;
	/**
	 * 应用于整个退出过渡期间的退出元素的 CSS 类。
	 * 默认为 `"s-exit-active"`。
	 */
	exitActiveClass?: string;
	/**
	 * 在退出过渡开始时应用于退出元素的 CSS 类，且在一帧后移除。
	 * 默认为 `"s-exit"`。
	 */
	exitClass?: string;
	/**
	 * 在退出过渡开始后应用于退出元素的 CSS 类。
	 * 默认为 `"s-exit-to"`。
	 */
	exitToClass?: string;
	/**
	 * 是否在初始渲染时应用过渡。默认为 `false`。
	 */
	appear?: boolean;
	/**
	 * 控制离开/进入过渡的时间序列。
	 * 可用的模式有 `"outin"` 和 `"inout"`；
	 * 默认为同时进行。
	 */
	mode?: 'inout' | 'outin';
};
/**
 * `<Transition>` 组件允许你在传递给 `props.children` 的元素上应用进入和退出动画。
 *
 * 它仅支持一次同时过渡一个元素。
 *
 * @param props {@link TransitionProps}
 */
declare const Transition: FlowComponent<TransitionProps>;

/**
 * {@link TransitionGroup} 组件的属性。
 */
type TransitionGroupProps = Omit<TransitionProps, 'mode'> & {
	/**
	 * 应用于移动元素的整个移动过渡期间的 CSS 类。
	 * 默认为 `"s-move"`。
	 */
	moveClass?: string;
};
/**
 * `<TransitionGroup>` 组件允许你在传递给 `props.children` 的元素上应用进入和退出动画。
 *
 * 它支持一次同时过渡多个元素并移动元素。
 *
 * @param props {@link TransitionGroupProps}
 */
declare const TransitionGroup: FlowComponent<TransitionGroupProps>;

export { Transition, TransitionEvents, TransitionGroup, TransitionGroupProps, TransitionProps };

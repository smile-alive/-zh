# React 小技巧

## Jsx

### 🍁 工厂函数&条件枚举

> ❌ App 不需要关心创建哪个过滤器。

```jsx
// bad 👎
function App(props) {
	if (props.type === 'city') {
		return <CityFilter />;
	} else if (props.type === 'category') {
		return <CategoryFilter />;
	} else {
		return <NoFound />;
	}
}
```

```jsx
// bad 👎
function App(props) {
	<>
		{props.type === 'city' ? (
			<CityFilter />
		) : props.type === 'category' ? (
			<CategoryFilter />
		) : (
			<NoFound />
		)}
	</>;
}
```

> ✅ 创建一个抽象，专门负责筛选过滤。

```jsx
// good 👍
function createFilter(props) {
	switch (props.type) {
		case 'city':
			return <CityFilter />;
		case 'category':
			return <CategoryFilter />;
		default:
			return <NoFound />;
	}
}

function App(props) {
	return createFilter(props);
}
```

优点：

-   **清晰易懂：** 使用 `switch` 语句使代码结构清晰，易于理解。

-   **灵活性：** 可以在 `createFilter` 函数中做更多的事情。

缺点：

-   **扩展性：** 如果需要添加新的过滤类型，必须修改 `createFilter` 函数，这可能导致该函数变得庞大并且不易维护。

-   **可读性：** 随着过滤器类型的增多，`switch` 语句可能变得冗长，影响代码的可读性。

---

```jsx
const FilterViews = {
	city: CityFilter,
	category: CategoryFilter
};

function App(props) {
	const Component = FilterViews[props.type] ?? NoFound;
	return <Component {...props} />;
}
```

优点：

-   **简洁：** 使用对象映射的方式更为紧凑，减少了冗余代码。

-   **易扩展：** 可以轻松地添加新的过滤器类型，无需修改原有代码。

缺点：

-   **定制性：** 对于每个过滤器类型，只能直接使用默认的 `key`，不够灵活。如果需要在渲染时进行更多的自定义逻辑，可能需要额外的处理。

#### 示例

> 多组件模式

```jsx
const Post = ({ content, author }) => {
	return (
		<div>
			<strong>{author}:</strong> {content}
		</div>
	);
};

const CodeBlock = ({ code }) => {
	return (
		<div>
			<code>{code}</code>
		</div>
	);
};

const Picture = ({ imageUrl, caption }) => {
	return (
		<div>
			<img src={imageUrl} alt={caption} />
			<p>{caption}</p>
		</div>
	);
};

function App() {
	return (
		<>
			<Post content='This is a great day!' author='Alex' />
			<CodeBlock code='public void static main...' />
			<Picture
				imageUrl='https://avatars.githubusercontent.com/u/72856252?v=4'
				caption='Vacation Photo'
			/>
		</>
	);
}
```

> 工厂函数模式

```jsx
function RolesViews({ type, ...item }) {
	switch (type) {
		case 'post':
			return <Post {...item} />;
		case 'code_block':
			return <CodeBlock {...item} />;
		case 'picture':
			return <Picture {...item} />;
		default:
			return <div>Unknown item type</div>;
	}
}

function App() {
	const feed = [
		{
			type: 'post',
			content: 'This is a great day!',
			author: 'Alex'
		},
		{
			type: 'code_block',
			code: 'public void static main...'
		},
		{
			type: 'picture',
			imageUrl: 'https://avatars.githubusercontent.com/u/72856252?v=4',
			caption: 'Vacation Photo'
		}
	];

	return (
		<>
			{feed.map((item) => (
				<RolesViews key={item.type} item={item} />
			))}
		</>
	);
}
```

> 枚举渲染模式

```jsx
function App() {
	const feed = [
		{
			type: Post,
			content: 'This is a great day!',
			author: 'Alex'
		},
		{
			type: CodeBlock,
			code: 'public void static main...'
		},
		{
			type: Picture,
			imageUrl: 'https://avatars.githubusercontent.com/u/72856252?v=4',
			caption: 'Vacation Photo'
		}
	];

	return (
		<>
			{feed.map(({ type: Component, ...item }, index) => (
				<Component key={index} {...item} />
			))}
		</>
	);
}
```

### 🍄 状态提前返回

> ❌ 过多的条件嵌套，导致代码可读性变差。

```jsx
function App({ user }) {
	const validateUser = (someUser) => {
		if (someUser.isActive) {
			if (someUser.isSubscribed) {
				if (someUser.hasSubscriptionExpired) {
					return true;
				} else {
					throw new Error('Upps, subscription has expired');
				}
			} else {
				throw new Error('Upps, user is not subscribed');
			}
		} else {
			throw new Error('Upps, user is not active');
		}
	};

	const isValidUser = validateUser(user);
	// rest of jsx...
}
```

> ✅ 条件提前返回，使得代码更明确可读。

```jsx
function App({ user }) {
	const validateUser = (someUser) => {
		if (!someUser.isActive) {
			throw new Error('Upps, user is not active');
		}

		if (!someUser.isSubscribed) {
			throw new Error('Upps, user is not subscribed');
		}

		if (!someUser.hasSubscriptionExpired) {
			throw new Error('Upps, subscription has expired');
		}

		return true;
	};

	const isValidUser = validateUser(user);
	// rest of jsx...
}
```

### 🥬 避免包裹地狱

> ❌ 繁琐嵌套

```jsx
const root = createRoot(document.getElementById('root'));
root.render(
	<ThemeContext.Provider>
		<UserContext.Provider>
			<QueryClientProvider client={queryClient}>
				<Redux.Provider store={store}>
					<App />
				</Redux.Provider>
			</QueryClientProvider>
		</UserContext.Provider>
	</ThemeContext.Provider>
);
```

> ✅ 创建一个渲染函数，用于处理配置项，简化繁琐的嵌套。

```jsx
const ProvidersTree = buildProvidersTree([
	[ThemeContext.Provider],
	[UserContext.Provider],
	[QueryClientProvider, { client: queryClient }],
	[Redux.Provider, { store }]
]);

const root = createRoot(document.getElementById('root'));
root.render(
	<ProvidersTree>
		<App />
	</ProvidersTree>
);
```

使用 `reduce` 方法从左到右迭代 `providersTreeConfig` 配置数组，并通过每次迭代返回一个新的函数组件来逐步构建 `ProvidersTree`。

```jsx
const buildProvidersTree = (providersTreeConfig) => {
	return providersTreeConfig.reduce(
		(AccumulatedComponents, [Provider, props = {}]) =>
			({ children }) =>
				(
					<AccumulatedComponents>
						<Provider {...props}>{children}</Provider>
					</AccumulatedComponents>
				),
		({ children }) => children
	);
};
```

使用 `reduceRight` 方法从右到左迭代 `providersTreeConfig` 配置数组，并将每个 `Provider` 和 `props` 嵌套到子节点中。

```jsx
const buildProvidersTree = (providersTreeConfig) => {
	return ({ children }) =>
		providersTreeConfig.reduceRight(
			(child, [Provider, props = {}]) => <Provider {...props}>{child}</Provider>,
			children
		);
};
```

## Effect

> useEffect 主要用于在 React 代码与外部系统进行同步。例如:
>
> -   `addEventListener` 事件监听
> -   `fetch` 请求
>
> 更多详细内容可参考**_[你可能不需要 Effect](https://react.jscn.org/learn/you-might-not-need-an-effect)_**

### 🌼 不要在 useEffect 中同步状态

> ❌ useEffect 用于处理副作用，而不是作为状态观察者。

```jsx
function UserForm() {
	const [value, setValue] = useState('');
	const [isValid, setIsValid] = useState(false);

	const handleChange = (e) => {
		const value = e.target.value;
		setValue(value);
	};

	useEffect(() => {
		setIsValid(isValueValid(value));
	}, [value]);

	return (
		<form>
			<label htmlFor='input'>Year of birth</label>
			<br />
			<input type='text' id='input' value={value} onChange={handleChange} />
		</form>
	);
}
```

> ✅ 直接在事件处理程序中同步状态，更符合直觉和预期行为。

```jsx
function UserForm() {
	const [value, setValue] = useState('');
	const [isValid, setIsValid] = useState(false);

	const handleChange = (e) => {
		const value = e.target.value;
		setValue(value);
		setIsValid(isValueValid(value));
	};

	return (
		<form>
			<label htmlFor='input'>Year of birth</label>
			<br />
			<input type='text' id='input' value={value} onChange={handleChange} />
		</form>
	);
}
```

### 🌟 避免不必要的 useEffect

> ❌ 无需使用 useEffect 来设置 `selectedPlan` 的默认值，这会导致子组件被渲染两次。

```jsx
function PlansSection() {
	const [plans, setPlans] = useState([]);
	const [selectedPlan, setSelectedPlan] = useState(null);

	useEffect(() => {
		fetch('/get/plans').then((response) => {
			setPlans(response.data.plans);
		});
	}, []);

	useEffect(() => {
		const defaultPlan = plans.find((plan) => plan.isDefault);
		setSelectedPlan(defaultPlan);
	}, [plans]);

	const onSelectPlan = (plan) => {
		setSelectedPlan(plan);
	};

	return (
		<ui>
			{plans.map((plan) => (
				<PLan
					key={plan.id}
					plan={plan}
					isSelected={plan.id === selectedPlan.id}
					onSelectPlan={onSelectPlan}
				/>
			))}
		</ui>
	);
}
```

> ✅ React 在执行 return 语句后，会立即重新渲染该组件，然后再渲染子组件。这样，子组件就不需要渲染两次。

```jsx
function PlansSection() {
	const [plans, setPlans] = useState([]);
	const [selectedPlan, setSelectedPlan] = useState(null);

	useEffect(() => {
		fetch('/get/plans').then((response) => {
			setPlans(response.data.plans);
		});
	}, []);

	if (selectedPlan === null) {
		const defaultPlan = plans.find((plan) => plan.isDefault);
		setSelectedPlan(defaultPlan);
	}

	const onSelectPlan = (plan) => {
		setSelectedPlan(plan);
	};

	return (
		<ui>
			{plans.map((plan) => (
				<PLan
					key={plan.id}
					plan={plan}
					isSelected={plan.id === selectedPlan.id}
					onSelectPlan={onSelectPlan}
				/>
			))}
		</ui>
	);
}
```

### ✨ 合理拆分 useEffect

> ❌ 避免在单个 useEffect 中同步处理多个独立的状态。

```jsx
function ShippingForm({ country }) {
	const [cities, setCities] = useState(null);
	const [city, setCity] = useState(null);
	const [areas, setAreas] = UseState(null);

	useEffect(() => {
		let ignore = false;
		fetch(`/api/cities?country=${country}`)
			.then((response) => response.json())
			.then((json) => {
				if (!ignore) {
					setCities(json);
				}
			});

		if (city) {
			fetch(`/api/areas?city=${city}`)
				.then((response) => response.json)
				.then((json) => {
					if (!ignore) {
						setAreas(json);
					}
				});
		}

		return () => {
			ignore = false;
		};
	}, [country, city]);
}
```

> ✅ 通过拆分为两个 useEffect，确保每个 useEffect 只关注于各自的依赖。

```jsx
function ShippingForm({ country }) {
	const [cities, setCities] = useState(null);

	useEffect(() => {
		let ignore = false;
		fetch(`/api/cities?country=${country}`)
			.then((response) => response.json())
			.then((json) => {
				if (!ignore) {
					setCities(json);
				}
			});

		return () => {
			ignore = false;
		};
	}, [country]);

	const [city, setCity] = useState(null);
	const [areas, setAreas] = UseState(null);

	useEffect(() => {
		if (city) {
			fetch(`/api/areas?city=${city}`)
				.then((response) => response.json)
				.then((json) => {
					if (!ignore) {
						setAreas(json);
					}
				});
		}
	}, [city]);
}
```

### 🌕 依赖优化

> ❌ 在每次渲染时，useEffect 的依赖项是一个具有每次新引用的对象，导致额外的重新渲染。

```jsx
export const MyComponent = ({ propA, propB }) => {
	const shape = {
		a: propA,
		b: propB
	};

	useEffect(() => {
		doSomeSideEffectsWithShape(shape);
	}, [shape]);

	// ...
};
```

> ✅ 将 `shape` 移至 useEffect 中，推迟其创建，从而减少不必要的渲染。

```jsx
export const MyComponent = ({ propA, propB }) => {
	useEffect(() => {
		const shape = {
			a: propA,
			b: propB
		};

		doSomeSideEffectsWithShape(shape);
	}, [propA, propB]);

	// ...
};
```

### 💦 避免在 useEffect 中使用循环依赖

> ❌ 当 `setCount` 更新 `count` 后，useEffect 会再次执行，导致循环依赖问题。

```jsx
function InfiniteLoopExample() {
	const [count, setCount] = useState(0);
	const [value, setValue] = useState(0);

	useEffect(() => {
		setCount(value + 1);
	}, [count, value]);

	return (
		<div>
			<input type='text' value={value} onChange={(event) => setValue(event.target.value)} />
			<p>{count}</p>
		</div>
	);
}
```

> ✅ 直接在函数组件内部定义计算属性。

```jsx
function InfiniteLoopExample() {
	const [value, setValue] = useState(0);

	const count = value + 1;

	return (
		<div>
			<input type='text' value={value} onChange={(event) => setValue(event.target.value)} />
			<p>{count}</p>
		</div>
	);
}
```

## State

> 在 React 中，减少不必要的渲染对于提升软件性能至关重要，因为 state 的变化会触发重新渲染。

### 🌸 状态下沉

> ❌ 每次 `name` 的变更都会引起 `<PageContent>` 重新渲染，带来不必要的性能开销。

```jsx
function App() {
	const [name, setName] = useState('');

	return (
		<>
			<form>
				<input value={name} onChange={(e) => setName(e.target.value)} />
			</form>
			<PageContent />
		</>
	);
}
```

> ✅ 将 `name` 移到独立的组件中，可以避免 `<PageContent>` 在 `name` 变更时导致的重新渲染。

```jsx
function Form() {
	const [name, setName] = useState('');

	return (
		<form>
			<input value={name} onChange={(e) => setName(e.target.value)} />
		</form>
	);
}

function App() {
	return (
		<>
			<Form />
			<PageContent />
		</>
	);
}
```

### 🥚 useState 具有异步特性

> ❌ `isUserAdult` 拿不到 `user.age` 的最新值。

```jsx
function App() {
	const [user, setUser] = useState({ name: '', age: '' });

	const onChangeAge = (event) => {
		setUser((prevUser) => ({ ...prevUser, age: event.target.value }));

		const isAdult = isUserAdult(user.age);
	};

	return <input onChange={onChangeAge} />;
}
```

> ✅ 将 `isUserAdult` 移动至函数外层，每次渲染都会计算最新的值。

```jsx
function App() {
	const [user, setUser] = useState({ name: '', age: '' });

	const onChangeAge = (event) => {
		setUser((prevUser) => ({ ...prevUser, age: event.target.value }));
	};

	const isAdult = isUserAdult(user.age);

	return <input onChange={onChangeAge} />;
}
```

### 🍙 使用 useState 时需提供默认值

> ❌ 在调用 `useState` 时不提供默认值，初始状态将为 `undefined`，可能引发一些不符合预期的问题。

```jsx
function App() {
	const [firstName, setFirstName] = useState();

	// changing an uncontrolled input to be controlled
	return <input value={firstName} onChange={(event) => setFirstName(event.target.value)} />;
}
```

> ✅ 为 `useState` 提供默认值，确保状态的可预测性。

```jsx
function App() {
	const [firstName, setFirstName] = useState('');

	return <input value={firstName} onChange={(event) => setFirstName(event.target.value)} />;
}
```

### 🍥 避免直接修改 state

> 直接修改 `user` 对象属性，未创建新的对象引用，React 无法检测状态变化，不会重新渲染组件。

```jsx
function App() {
	const [user, setUser] = useState({ name: '', age: '' });

	function onUserAgeChange(nextAge) {
		user.age = nextAge;
		setUser(user);
	}

	// ...
}
```

> 使用新的对象引用，确保 React 可以正常检测到状态变化并触发重新渲染组件。

```jsx
function App() {
	const [user, setUser] = useState({ name: '', age: '' });

	function onUserAgeChange(nextAge) {
		const nextUser = { ...user, age: nextAge };
		setUser(user);
	}

	// ...
}
```

## Ref

> ref 不会触发组件重新渲染，通常用于获取或操作一个不影响 UI 的值。

### 🌝 更安全的 DOM 操作方式

> ❌ 避免直接操纵 DOM

```jsx
function App() {
	// 添加新用户时，滚动到列表底部
	const onAddNewUser = () => {
		const userList = document.getElementById('user-list');
		userList.scrollTop = userList.scrollHeight;
	};

	return (
		<>
			<ul id='user-list'>
				<li>User 1</li>
				<li>User 2</li>
				{/* ... */}
			</ul>
			<button onClick={onAddNewUser}>Add User</button>
		</>
	);
}
```

> ✅ 使用 `ref` 代替直接 DOM 操作

```jsx
function App() {
	const userListRef = useRef(null);

	const onAddNewUser = () => {
		userListRef.current.scrollTop = userListRef.current.scrollHeight;
	};

	return (
		<>
			<ul id='user-list' ref={userListRef}>
				<li>User 1</li>
				<li>User 2</li>
				{/* ... */}
			</ul>
			<button onClick={onAddNewUser}>Add User</button>
		</>
	);
}
```

### 🌛 Ref 透传

```jsx
function App() {
	const userListRef = useRef(null);

	const onAddNewUser = () => {
		userListRef.current.scrollTop = userListRef.current.scrollHeight;
	};

	return <UserList ref={userListRef} />;
}

const List = React.forwardRef(function List(props, ref) {
	return (
		<ul id='user-list' ref={ref}>
			<li>User 1</li>
			<li>User 2</li>
			{/* ... */}
		</ul>
	);
});
```

### 🌜 暴露组件内部方法

```jsx
function App() {
	const userListRef = useRef(null);

	const onAddNewUser = () => userListRef.current.scrollToBottom();

	// 我们可以通过 `userListRef` 访问 `scrollToBottom` 方法。
	return <UserList ref={userListRef} />;
}

const List = React.forwardRef(function List(props, ref) {
	const listRef = useRef(null);

	// 向父组件暴露 `scrollToBottom` 方法。
	useImperativeHandle(
		ref,
		() => ({
			scrollToBottom() {
				listRef.current.scrollTop = listRef.current.scrollHeight;
			}
		}),
		[]
	);

	return (
		<ul id='user-list' ref={listRef}>
			<li>User 1</li>
			<li>User 2</li>
			{/* ... */}
		</ul>
	);
});
```

### 💫 同步 DOM 操作与 State 变更

> ❌ 直接在 state 变更后调用 `scrollToLastMessage` 可能导致滚动效果不如预期。

```jsx
function App() {
	const [messages, setMessages] = useState([]);

	const pushMessage = () => {
		setMessages((m) => [...m, Math.random().toFixed(2)]);
		scrollToLastMessage();
	};

	function scrollToLastMessage() {
		// ...
	}
}
```

> ✅ 使用 `setTimeout` 或 `requestAnimationFrame` 延迟更新，确保在 DOM 渲染后执行。

```jsx
function App() {
	const [messages, setMessages] = useState([]);

	const pushMessage = () => {
		setMessages((m) => [...m, Math.random().toFixed(2)]);
		setTimeout(() => {
			scrollToLastMessage();
		}, 0);
	};

	function scrollToLastMessage() {
		// ...
	}
}
```

> ✅ 利用 `useEffect` 监听 `messages` 变化，在组件渲染完成后执行，以获取最新的 DOM 信息。

```jsx
function App() {
	const [messages, setMessages] = useState([]);

	const pushMessage = () => {
		setMessages((m) => [...m, Math.random().toFixed(2)]);
	};

	function scrollToLastMessage() {
		// ...
	}

	useEffect(() => {
		scrollToLastMessage();
	}, [messages]);
}
```

> ✅ 使用 **_[flushSync](https://react.jscn.org/reference/react-dom/flushSync)_** 强制同步刷新 DOM，确保在调用 `scrollToLastMessage` 时 DOM 包含最新信息。

```jsx
function App() {
	const [messages, setMessages] = useState([]);

	const pushMessage = () => {
		flushSync(() => {
			setMessages((m) => [...m, Math.random().toFixed(2)]);
		});
		scrollToLastMessage();
	};

	function scrollToLastMessage() {
		// ...
	}
}
```

### 🌥️ 动态获取 Ref

> ❌ React 在每轮渲染中创建的 `ref` 对象引用不会发生变更，因此使用 `ref` 不会触发 Effect 的重新运行。

```jsx
function App() {
	const refElement = useRef(null);
	const [height, setHeight] = useState(0);

	useEffect(() => {
		if (refElement.current) {
			setHeight(refElement.current.offsetHeight);
		}
	}, [refElement.current]);

	return <div ref={refElement}>{/* ... */}</div>;
}
```

> ✅ 使用 `ref` 回调函数的方式， 每次渲染都能获取到最新的 `ref` 值。

```jsx
function App() {
	const [height, setHeight] = useState(0);

	const onRefChange = (node) => {
		if (node !== null) {
			setHeight(node.getBoundingClientRect().height);
		}
	};

	return <div ref={onRefChange}>{/* ... */}</div>;
}
```

## Component

### 🚀 灵活扩展的组件

> ❌ 缺乏拓展性，对组件的微小调整就可能涉及大量属性的修改。
>
> 1. 如果想显示一个特定的图标？
> 2. 或者希望在相反的位置显示图标？ ... 这样就会导致我们需要处理大量的属性和应对各种情况。

```jsx
function App() {
	return (
		<Alert
			header='Upps an error occurred'
			variant='error'
			icon='error'
			description='Seems like an error happened :\'
		/>
	);
}
```

> ✅ 在保持组件逻辑不变的前提下，轻松扩展或覆盖功能。

```jsx
function App() {
	return (
		<Alert status='error'>
			{/* Icon 的位置我们可以随便放置与更改 */}
			<Icon />
			<Alert.Title>Your browser is outdated!</Alert.Title>
			<Alert.Description>Your Volunteer Hub experience may be degraded.</Alert.Description>
		</Alert>
	);
}

function Alert({ status, children }) {
	return <div className={status}>{children}</div>;
}

Alert.Title = function AlertTitle({ children }) {
	return <span className='alert-title'>{children}</span>;
};

Alert.Description = function AlertDescription({ children }) {
	return <span className='alert-description'>{children}</span>;
};
```

### 🌱 避免过早优化

> 当 `background` 发生变化时，React 会重新渲染 `ExpensiveComponent`，这并非最优选择！
>
> > 尽管使用 `memo` 可以防止重新渲染，但在没有实际性能问题的情况下，过早进行优化可能会增加代码复杂性。

```jsx
function App() {
	const [background, setBackground] = useState('blue');

	const onChangeBackground = (event) => {
		setBackground(event.target.value);
	};

	return (
		<div>
			<input value={background} onChange={onChangeBackground} />
			<div style={{ background }}>尝试更改背景颜色！</div>
			<ExpensiveComponent />
		</div>
	);
}

const ExpensiveComponent = React.memo(function ExpensiveComponent() {
	// jsx
});
```

> 可以将 `App` 组件分为两个部分：`BackgroundPicker` 和 `ExpensiveComponent`。
> 然后将 `ExpensiveComponent` 作为 `children` 属性传递给 `BackgroundPicker` 来实现简单的渲染优化。
>
> > 当背景变化时，`BackgroundPicker` 会重新渲染，但由于其 `children` 属性保持不变，因此 React 不会重新渲染子组件。

```jsx
function App() {
	return (
		<BackgroundPicker>
			<ExpensiveComponent />
		</BackgroundPicker>
	);
}

function BackgroundPicker() {
	const [background, setBackground] = useState('blue');

	const onChangeBackground = (event) => {
		setBackground(event.target.value);
	};

	return (
		<div>
			<input value={background} onChange={onChangeBackground} />
			<div style={{ background }}>尝试更改背景颜色！</div>
			{children}
		</div>
	);
}

function ExpensiveComponent() {
	// jsx
}
```

### 🧻 减少重复渲染

> ❌ 滚动时 `Post` 组件会频繁重新渲染，影响性能。

```jsx
function Post() {
	const [progress, setProgress] = useState(0);

	const onScroll = () => {
		setProgress(window.scrollY);
	};

	useEffect(() => {
		window.addEventListener('scroll', onScroll);

		return () => {
			window.removeEventListener('scroll', onScroll);
		};
	}, []);

	console.log('Expensive Render');

	return (
		<div style={{ height: 2000 }}>
			<p>Progress: {progress}</p>
			<h1>post</h1>
		</div>
	);
}
```

> ✅ 创建 `PostLayout` 组件专门处理滚动逻辑，将 `Post` 作为 `children` 属性传入，可以有效减少不必要的重复渲染。

```jsx
function Post() {
	console.log('Expensive Render');

	return (
		<PostLayout>
			<h1>post</h1>
		</PostLayout>
	);
}

function PostLayout({ children }) {
	const [progress, setProgress] = useState(0);

	const onScroll = () => {
		setProgress(window.scrollY);
	};

	useEffect(() => {
		window.addEventListener('scroll', onScroll);

		return () => {
			window.removeEventListener('scroll', onScroll);
		};
	}, []);

	console.log('Expensive Render');

	return (
		<div style={{ height: 2000 }}>
			<p>Progress: {progress}</p>
			{children}
		</div>
	);
}
```

### 💥 业务逻辑与 UI 分离

> 视图不应关心数据的获取。

```jsx
function ItemPage({ itemId }) {
	const [item, setitem] = useState();

	useEffect(() => {
		const fetchitem = async () => {
			const res = await fetch(`https://api.example.com/items/${itemId}`);
			setItem(res.json());
		};
		fetchItem();
	}, []);

	const onSubmit = () => {
		// ... submit logic here
	};

	return (
		<Container>
			<Name>{item.name} </Name>
			<Price>{item.discountPrice || item.price}</Price>
			<Button onClick={onSubmit}>Add to cart</Button>
		</Container>
	);
}
```

> 通过将数据获取逻辑封装到 `useItem` 钩子中，将视图层与数据层分离，使得 `ItemPage` 组件更专注于渲染 UI 和处理用户交互

```jsx
// helpers/item.js
const parseItem = (item) => {
	return {
		...item,
		finalPrice: item.discountPrice || item.price
	};
};

// api/item.js
const getItemById = async (id) => {
	const res = await fetch(`https://api.example.com/items/${id}`);
	const item = parseItem(res.json());
	return item;
};

function useItem({ itemId }) {
	const [item, setItem] = useState();

	useEffect(() => {
		const fetchitem = async () => {
			const res = await itemsApi.getItemById(itemId);
			setItem(res);
		};
		fetchItem();
	}, []);

	return { item };
}

function ItemPage({ itemId }) {
	const { item } = useItem({ itemId });

	const onSubmit = () => {
		// ... submit logic here
	};

	return (
		<Container>
			<Name>{item.name}</Name>
			<Price>{item.finalPrice}</Price>
			<Button onClick={onSubmit}>Add to cart</Button>
		</Container>
	);
}
```

### ☔️ 组件目标单一、分工明确

> 应用逻辑与 UI 混合。
>
> -   `Card` 组件负责处理外观和基本样式，但存在应用逻辑。

```jsx
function Card({ feature, type, children }) {
	const classNames =
		type === 'outline' ? 'border border-gray-200 bg-transparent' : 'bg-purple-400';

	if (!feature) {
		return null;
	}

	return <div className={classNames}>{children}</div>;
}
```

> 确保每个组件保持相对简单，专注于单一目的。
>
> -   `FeatureCard` 是 `Card` 的具体抽象，处理特殊的应用逻辑。
> -   `Card` 组件负责处理外观和基本样式，无关乎应用逻辑。

```jsx
function FeatureCard({ feature, type, children }) {
	if (!feature) {
		return null;
	}

	return <Card type={type}>{children}</Card>;
}

function Card({ type, children }) {
	const classNames =
		type === 'outline' ? 'border border-gray-200 bg-transparent' : 'bg-purple-400';

	return <div className={classNames}>{children}</div>;
}
```

## Event

### 🍪 在 React 中使用柯里化事件处理方式

> ❌ 代码简洁直观。每次渲染都会创建一个新的匿名函数，会有多余的性能开销。

```jsx
function UserForm() {
	const [items, setItems] = useState([]);
	const [selectedItem, setSelectedItem] = useState(null);

	const onItemClick = (item) => {
		setSelectedItem(item);
	};

	return (
		<ul>
			{items.map((item) => (
				<li onClick={() => onItemClick(item)} key={item.id}>
					{item.name}
				</li>
			))}
		</ul>
	);
}
```

> ✅ 通过柯里化的方式，避免了在渲染期间创建新的匿名函数，潜在地提高了性能。

```jsx
function UserForm() {
	const [items, setItems] = useState([]);
	const [selectedItem, setSelectedItem] = useState(null);

	const onItemClick = (item) => () => {
		setSelectedItem(item);
	};

	return (
		<ul>
			{items.map((item) => (
				<li onClick={onItemClick(item)} key={item.id}>
					{item.name}
				</li>
			))}
		</ul>
	);
}
```

## 逻辑优化

### 🌪️ 减少不必要的 if

```jsx
const canUserPlaceOrder = (product, payment) => {
	let canPlaceOrder = false;
	if (product.hasStock === true) {
		if (payment.rocessed === true) {
			canPlaceOrder = true;
		} else {
			canPlaceOrder = false;
		}
	} else {
		canPlaceOrder = false;
	}

	return canPlaceOrder;
};
```

> step1: 省略不必要的变量 `canPlaceOrder`，直接返回结果。

```jsx
const canUserPlaceOrder = (product, payment) => {
	if (product.hasStock === true) {
		if (payment.rocessed === true) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
};
```

> step2: 颠倒 if/else 语句以提前返回。

```jsx
const canUserPlaceOrder = (product, payment) => {
	if (product.hasStock === false) {
		return false;
	} else if (payment.rocessed === true) {
		return true;
	} else {
		return false;
	}
};
```

> step3: 合并并提前返回前两个 if 语句。

```jsx
const canUserPlaceOrder = (product, payment) => {
	if (product.hasStock === true && payment.rocessed === true) {
		return true;
	} else {
		return false;
	}
};
```

> step4: 删除全等判断。

```jsx
const canUserPlaceOrder = (product, payment) => {
	if (product.hasStock && payment.rocessed) {
		return true;
	} else {
		return false;
	}
};
```

> step5: 将条件本身作为 return 语句返回。

```jsx
const canUserPlaceOrder = (product, payment) => {
	return product.hasStock && payment.rocessed;
};
```

> step6: 使用隐式箭头函数返回。

```jsx
const canUserPlaceOrder = (product, payment) => product.hasStock && payment.rocessed;
```

> step7: 解构所需参数。

```jsx
const canUserPlaceOrder = ({ hasStock }, { rocessed }) => hasStock && rocessed;
```

### 🌚 避免使用难以阅读的条件语句

> ❌ 难以阅读和维护。

```jsx
function ShippingCost({ address }) {
	if (address.country === 'ZH' && address.zipCode === '40202') {
		return '¥10';
	} else if (address.country === 'ZH' && address.zipCode === '60601') {
		return '¥5';
	} else {
		return '¥20';
	}
}
```

> ✅ 更短、更易读的代码。

```jsx
import { match } from 'ts-pattern';

function ShippingCost({ address }) {
	return match(address)
		.with({ country: 'ZH', zipCode: '40202' }, () => '¥10')
		.with({ country: 'ZH', zipCode: '60601' }, () => '¥5')
		.otherwise(() => '¥20');
}
```

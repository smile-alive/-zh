# 如何使你的 React 更高级

## render

### 😀 条件枚举&工厂函数

> ❌ 应用程序不应该关心创建哪个过滤器。

```jsx
function App(props) {
	if (props.type === 'city') {
		return <CityFilter />;
	} else if (props.type === 'category') {
		return <CategoryFilter />;
	} else {
		return <NoFilter />;
	}
}
```

```jsx
function App(props) {
	<>
		{props.type === 'city' ? (
			<CityFilter />
		) : props.type === 'category' ? (
			<CategoryFilter />
		) : (
			<NoFilter />
		)}
	</>;
}
```

> ✅ 创建一个巧妙的抽象，负责处理筛选条件的创建。

```jsx
function createFilter(props) {
	switch (props.type) {
		case 'city':
			return <CityFilter />;
		case 'category':
			return <CategoryFilter />;
		default:
			return <NoFilter />;
	}
}

function App(props) {
	return createFilter(props);
}
```

优点：

1. **清晰易懂：** 使用 `switch` 语句使代码结构清晰，易于理解。
2. **灵活性：** 可以在 `createFilter` 函数中添加更多的条件和定制逻辑。

缺点：

1. **扩展性：** 如果需要添加新的过滤器类型，必须修改 `createFilter` 函数，这可能导致该函数变得庞大并且不易维护。
2. **可读性：** 随着过滤器类型的增多，`switch` 语句可能变得冗长，影响代码的可读性。

---

```jsx
const FilterViews = {
	city: CityFilter,
	category: CategoryFilter
};

function App(props) {
	const Component = FilterViews[props.type] ?? NoFilter;
	return <Component {...props} />;
}
```

优点：

1. **简洁：** 使用对象映射的方式更为紧凑，减少了冗余代码。
2. **易扩展：** 可以轻松地添加新的过滤器类型，无需修改原有代码。

缺点：

1. **定制性：** 对于每个过滤器类型，只能直接使用默认的 `key`，不够灵活。如果需要在渲染时进行更多的自定义逻辑，可能需要额外的处理。
2. **可读性：** 对于不熟悉该模式的开发者来说，理解映射关系可能需要一些额外的思考。

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
function TemplateFactory({ item }) {
	switch (item.type) {
		case 'post':
			return <Post content={item.content} author={item.author} />;
		case 'code_block':
			return <CodeBlock code={item.code} />;
		case 'picture':
			return <Picture imageUrl={item.imageUrl} caption={item.caption} />;
		default:
			return <div>Unknown item type</div>;
	}
}

function App() {
	const feed = [
		{ type: 'post', content: 'This is a great day!', author: 'Alex' },
		{ type: 'code_block', code: 'public void static main...' },
		{
			type: 'picture',
			imageUrl: 'https://avatars.githubusercontent.com/u/72856252?v=4',
			caption: 'Vacation Photo'
		}
	];

	return (
		<>
			{feed.map((item) => (
				<TemplateFactory key={item.type} item={item} />
			))}
		</>
	);
}
```

> 枚举渲染模式

```jsx
function App() {
	const feed = [
		{ type: Post, content: 'This is a great day!', author: 'Alex' },
		{ type: CodeBlock, code: 'public void static main...' },
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

### 😆 状态提前返回

> ❌ 过多的条件嵌套，导致代码可读性变差

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

> ✅ 通过条件提前返回，提高可读性

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

### 🥲 避免包裹地狱

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

> ✅ 简洁配置

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

```jsx
/**
 * 构建 ProvidersTree 的函数
 * @param {Array} providersTreeConfig - 配置数组，包含 Provider 组件和其属性
 * @returns {Function} - 使用 reduceRight 方法从右到左迭代 providersTreeConfig 配置数组，并将每个提供者组件和属性嵌套到子节点中。返回一个高阶函数，接受最内层渲染节点作为参数
 */
const buildProvidersTree = (providersTreeConfig) => {
	return ({ children }) =>
		providersTreeConfig.reduceRight(
			(child, [Provider, props]) => <Provider {...props}>{child}</Provider>,
			children
		);
};
```

```jsx
/**
 * 构建 ProvidersTree 的函数
 * @param {Array} providersTreeConfig - 配置数组，包含 Provider 组件和其属性
 * @returns {Function} - 使用 reduce 方法从左到右迭代 providersTreeConfig 配置数组，并通过每次迭代返回一个新的函数组件来逐步构建 ProvidersTree。返回一个函数组件，用于包装子元素并构建 ProvidersTree
 */
const buildProvidersTree = (providersTreeConfig) => {
	return providersTreeConfig.reduce(
		(AccumulatedComponents, [Provider, props]) =>
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

## Effect

### 😣 不要在 useEffect 中同步状态

> ❌ useEffect 应该用于在 React 代码和非 React 代码（外部系统）之间建立同步。

```jsx
function UserForm() {
	const [value, setValue] = useState('');
	const [isValid, setIsValid] = useState(false);

	const handleChange = (e) => {
		const value = e.target.value;
		setValue(value);
	};

	useEffect(() => {
		if (isValueValid(value)) {
			setIsValid(true);
		} else {
			setIsValid(false);
		}
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

> ✅ 直接在事件处理程序中同步状态

```jsx
function UserForm() {
	const [value, setValue] = useState('');
	const [isValid, setIsValid] = useState(false);

	const handleChange = (e) => {
		const value = e.target.value;
		setValue(value);

		if (isValueValid(value)) {
			setIsValid(true);
		} else {
			setIsValid(false);
		}
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

## State

> 在 `React` 中，减少不必要的渲染对于提升软件性能至关重要，因为 `state` 的变化会触发重新渲染。

### 🤪 状态下沉

> 每次 `name` 的变更都会引起 `<PageContent>` 重新渲染，带来不必要的性能开销。

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

> 将 `name` 移到独立的组件中，可以避免 `<PageContent>` 在 `name` 变更时导致的重新渲染。

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

## Reducer

## Ref

### 更安全的 DOM 操作方式

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

### 使用 `forwardRef` 实现 `ref` 透传

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

### 使用 `forwardRef` 与 `useImperativeHandle` 暴露组件方法

```jsx
function App() {
	const userListRef = useRef(null);

	const onAddNewUser = () => userListRef.current.scrollToBottom();

	// 我们可以通过 `userListRef` 访问 `scrollToBottom` 方法。
	return <UserList ref={userListRef} />;
}

const List = React.forwardRef(function List(props, ref) {
	const listRef = useRef(null);

	// 我们通过引用的方式公开了 scrollToBottom 方法，这样父组件就能方便地使用它。
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

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

> 🎉 创建一个巧妙的抽象，负责处理筛选条件的创建。

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

#### 应用

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

export default function App() {
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

> ❌ 条件嵌套，导致代码可读性变差

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

> 🎉 条件提前返回，提高可读性

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

## useEffect

## useState

## useReducer

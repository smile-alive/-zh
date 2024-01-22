# TypeScript uitls

```ts
/**
 * 使T中的所有属性变为可选
 */
type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * 使T中的所有属性变为必选
 */
type Required<T> = {
  [P in keyof T]-?: T[P];
};

/**
 * 使T中的所有属性变为只读
 */
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

/**
 * 从T中挑选出键为K联合类型的一组属性
 */
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * 构造一个具有一组键K和类型T的类型
 */
type Record<K extends keyof any, T> = {
  [P in K]: T;
};

/**
 * 从T中排除那些可以赋值给U的类型
 */
type Exclude<T, U> = T extends U ? never : T;

/**
 * 从T中提取那些可以赋值给U的类型
 */
type Extract<T, U> = T extends U ? T : never;

/**
 * 构造一个具有T类型属性但不在类型K中的属性的类型
 */
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

/**
 * 从T中排除null和undefined
 */
type NonNullable<T> = T & {};

/**
 * 获取函数类型的参数类型的元组
 */
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

/**
 * 获取构造函数类型的参数类型的元组
 */
type ConstructorParameters<T extends abstract new (...args: any) => any> = T extends abstract new (...args: infer P) => any ? P : never;

/**
 * 获取函数类型的返回类型
 */
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

/**
 * 获取构造函数类型的返回类型
 */
type InstanceType<T extends abstract new (...args: any) => any> = T extends abstract new (...args: any) => infer R ? R : any;

/**
 * 将字符串字面类型转换为大写
 */
type Uppercase<S extends string> = intrinsic;

/**
 * 将字符串字面类型转换为小写
 */
type Lowercase<S extends string> = intrinsic;

/**
 * 将字符串字面类型的第一个字符转换为大写
 */
type Capitalize<S extends string> = intrinsic;

/**
 * 将字符串字面类型的第一个字符转换为小写
 */
type Uncapitalize<S extends string> = intrinsic;

```


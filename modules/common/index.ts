
type Await<T> = T extends PromiseLike<infer U> ? U : T

// prettier-ignore
export const replaceAsync = <F extends (...p: any[]) => Promise<any>>(
	_f: F,
	effect: (r: Await<ReturnType<F>>) => any,
	capture?: (...p: any[]) => any,
	filter?: (...p: Parameters<F>) => Parameters<F>,
	final?: (...p: any[]) => any,
	early?: (...p: any[]) => any
) => {
	const f = _f
	return (async (...p: any[]) => {
		let res = undefined
		const params = filter ? filter(...(p as Parameters<F>)) : p
		try {
			if (early) {
				res = await early(...params)
			}
			if (res === undefined) {
				res = await f(...params)
			}
			res = await effect(res)
		} catch (error) {
			if (capture) capture(error)
			throw error
		} finally {
			if (final) final(res)
		}
		return res
	}).bind(this) as F
}

export const safeReplaceAsync = <F extends (...p: any[]) => Promise<any>>(
	_f: F,
	{
		filter,
		early,
		effect,
		capture,
		final,
		replace
	} : {
		filter?: (...p: Parameters<F>) => any,
		early?: (...p: any[]) => any
		effect: (r: Await<ReturnType<F>>) => any,
		capture?: (...p: any[]) => any,
		final?: (...p: any[]) => any,
		replace?: (...p: any[]) => any
	}
) => {
	const f = _f
	return (async (...p: any[]) => {
		let res
		if (filter) filter(...(p as Parameters<F>))
		const params = p
		try {
			if (early) early(...params)
			res = await f(...params)
			if (effect) effect(res)
		} catch (error) {
			if (capture) capture(error)
			throw error
		} finally {
			if (final) final(res)
		}
		return replace ? replace() : res
	}).bind(this) as F
}

export const chunk = <T>(array: T[], size: number) =>
	Array.from(Array(Math.ceil(array.length / size)).keys()).map(i =>
		array.slice(i * size, i * size + size)
	)

export const maybeArray = <T>(maybe: T | T[]) : T[] => {
	return Array.isArray(maybe) ? maybe : [maybe]
}

export const simpleURL = ( base : string, path : string = '' ) => (
	new URL( path, base )
)

import type { Application } from '@feathersjs/feathers'
import { useMemo } from 'react'
import { makeHookContext } from 'asas-virtuais/modules/react/context'
import { Service } from 'asas-virtuais/modules/feathers/service'
import { AxiosInstance } from 'axios'

export const useFeathers = ( {feathers} : {feathers : Application<{
	[K in string] : Service<any>
}>} ) => {

	return {
		feathers : useMemo(() => feathers, [feathers])
	}
}
export const { Provider, useContext } = makeHookContext( useFeathers )

export const useRest = () => {
	return (useContext().feathers as any).rest as AxiosInstance
}

export default {
	useContext,
	Provider,
	useFeathers,
	useRest
}
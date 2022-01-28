import {
	Params,
	Query,
} from 'asas-virtuais/modules/feathers/service'
import Airtable from 'airtable'
import { ServiceMethods } from 'asas-virtuais/modules/feathers/service'
import Axios from 'axios'
import { Paginated } from '@feathersjs/feathers'
import { feathersResultToArray } from '../util'

type AParams = {
	query ?: {
		'$view' ?: string
		'$format' ?: 'json' | 'string'
		'$timezone' ?: string
		'$locale' ?: string
	}
}

export type InferRecordT<R> = R extends Airtable.Record<infer T> ? T : never

export const valueStr = (value: any) => {
	const type = typeof value
	switch (type) {
		case 'number':
			return value
		case 'boolean':
			return value ? 1 : 0
		default:
			return `'${mapQuery(value)}'`
	}
}

export const mapRecord = <R extends Airtable.Record<any>>(
	rec: R
): InferRecordT<R> & { id: string } => ({
	id: rec.id,
	...rec.fields
})


export const comparisonOperators = [
	'$ne',
	'$in',
	'$lt',
	'$lte',
	'$gt',
	'$gte',
	'$nin',
	'$in',
	'$or'
]

export const mapQuery = (queryParams?: any): string => {
	const condtionals = []
	const $or = queryParams?.['$or']

	if (typeof queryParams !== 'object') {
		return queryParams
	}

	if ($or) {
		condtionals.push(
			`OR(${$or
				.filter(
					(queryParam: any) =>
						['$or', '$in'].includes(queryParam) ||
						typeof queryParam === 'object'
				)
				.map((queryParam: any) => {
					return Object.keys(queryParam).map(key => {
						if (typeof queryParam[key] === 'object') {
							return mapQuery(queryParam)
						} else {
							return `{${key}} = ${valueStr(
								mapQuery(queryParam[key])
							)}`
						}
					})
				})
				.join(',')})`
		)
	} else {
		// AND
		// @todo fix unecessary AND breaking query
		condtionals.push(
			`${Object.keys(queryParams)
				.filter(field => {
					return !comparisonOperators.includes(field)
				})
				.map(field => {
					if (typeof queryParams[field] === 'object') {
						const {
							$in,
							$nin,
							$lt,
							$lte,
							$gt,
							$gte,
							$ne
						} = queryParams[field]
						if ($in) {
							const $ors = $in.map((param: any) => {
								return { [field]: `${param}` }
							})
							return mapQuery({ $or: $ors })
						} else if ($nin) {
							const $ors = $nin.map((param: any) => {
								return { [field]: `${param}` }
							})
							return `NOT(${mapQuery({ $or: $ors })})`
						} else if ($lt) {
							return `{${field}} < ${$lt}`
						} else if ($lte) {
							return `{${field}} <= ${$lte}`
						} else if ($gt) {
							return `{${field}} > ${$gt}`
						} else if ($gte) {
							return `{${field}} >= ${$gte}`
						} else if ($ne) {
							return `{${field}} != ${$ne}`
						} else {
							throw Error(`Invalid Operator ${field}`)
						}
					}
					return `{${field}} = ${mapQuery(queryParams[field])}`
				})
				.join(',')}`
		)
	}

	if (condtionals.length > 1) {
		return condtionals.join(',')
	}
	return condtionals.join('')
}

type Options = {
	apiKey : string,
	base : string,
	table : string,
	version ?: string
	paginate ?: {
		max ?: number
		default ?: number
	}
}

type AirtableData = Airtable.FieldSet & { id: string }

const service = <T extends AirtableData>( { base, table, apiKey, version = 'v0', paginate = {
	default : 100
} } : Options ) => {

	type PaginatedT = Paginated<T> & { offset ?: string }
	type FindResult = T[] | PaginatedT
	type WriteResult = T | T[]

	const queryFilters = (query: Query<T> = {}) => {	

		let filterByFormula : string | undefined

		const operators = Object.keys(query).filter(queryParam =>
			comparisonOperators.includes(queryParam)
		)
	
		const equalityConditionals = Object.keys(query).filter(
			queryParam => queryParam.charAt(0) !== '$'
		)

		if (operators.length > 0) {
			const filters = operators.map(key => {
				if (typeof query[key] === 'object') {
					return mapQuery({ [key]: query[key] })
				}
				return `{${key}} = ${valueStr(query[key])}`
			})
	
			if (filters.length > 1) {
				filterByFormula = `AND(${filters.join(',')})`
			} else {
				filterByFormula = filters.join('')
			}
		} else if (equalityConditionals.length > 0) {
			const filters = equalityConditionals.map(key => {
				if (typeof query[key] === 'object') {
					return mapQuery({ [key]: query[key] })
				}
				return `{${key}} = ${valueStr(query[key])}`
			})
	
			if (filters.length > 1) {
				filterByFormula = `AND(${filters.join(',')})`
			} else {
				filterByFormula = filters.join('')
			}
		}
		return filterByFormula
	}

	const axios = Axios.create( {
		baseURL : `https://api.airtable.com/${version}/${base}/${table}`,
		headers : {
			'Authorization' : `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		}
	} )

	const mapParams = ( params : Params<T> & AParams ) => {
		const queryParams : {
			maxRecords ?: number
			fields ?: string[]
			queryFilters ?: string
			pageSize ?: number
			sort ?: {
				[K in keyof T] : 'asc' | 'desc'
			}
			view ?: string
			cellFormat ?: 'json' | 'string'
			timeZone ?: string
			userLocale ?: string
	
		} = {}
		const limit = params.query?.$limit
		const skip = params.query?.$skip
		const sort = params.query?.$sort
		const select = params.query?.$select
		const max = params.paginate?.max ?? paginate?.max
		const view = params.query?.$view
		const format = params.query?.$format
		const timezone = params.query?.$timezone
		const locale = params.query?.$locale

		const filters = queryFilters(params.query)

		if ( filters ) {
			queryParams.queryFilters = filters
		}

		if ( limit ) {
			queryParams.maxRecords = limit
		}
		if ( skip ) {
			queryParams.maxRecords = (limit ?? 0) + skip
		}
		if ( max ) {
			queryParams.pageSize = max
		}
		if ( select ) {
			queryParams.fields = select as string[]
		}
		if ( sort && typeof sort === 'object' ) {
			queryParams.sort = Object.entries(sort).reduce((acc, [key, direction]) => {
				acc[key] = direction === 1 ? 'asc' : 'desc'
				return acc
			}, {} as any)
		}
		if ( view ) {
			queryParams.view = view
		}
		if ( format ) {
			queryParams.cellFormat = format
		}
		if ( timezone ) {
			queryParams.timeZone = timezone
		}
		if ( locale ) {
			queryParams.userLocale = locale
		}

		return queryParams
	}

	const uglyPatchUpdate = ( method: 'patch' | 'put', params : Partial<Params<T>> = {}, fields : Partial<T> ) : Promise<{ data : { records : T[] } }> => {
		return methods.find( params ).then( feathersResultToArray ).then( arr => {
			return axios[method]('', {
				records: arr.map( ({id}) => ({
					id,
					fields
				}))
			})
		} )
	}

	const spreadFields = ( result : T | Paginated<T> | T[] ) => {
		feathersResultToArray( result ).forEach( record => {
			if ( record.fields ) {
				Object.assign( record, record.fields )
				delete record.fields
			}
		} )
		return result
	}

	const methods : ServiceMethods<T> = {

		get( id, _params : Params<T> = {} ) {
			return axios.get( `/${id}` ).then( res => res.data as T ).then( res => spreadFields(res) as T )
		},
		find( params = {} ) {
			const mapped = mapParams(params)
			return axios.get<{
				records : T[],
				offset ?: string
			}>( `/`, {
				params : mapped
			} ).then( res => (paginate ? ({
				total : undefined,
				skip : params?.query?.$skip,
				limit : mapped?.maxRecords,
				data : res.data.records,
				offset : res.data.offset
			}) : res.data.records) as FindResult )
			.then( res => spreadFields( res ) as FindResult )
		},
		create ( data, _params ) {
			return axios.put( `/`, {
				records : (Array.isArray( data ) ? data : [data]).map( (d) => ({
					fields : d
				}))
			} ).then( res => res.data.records )
			.then( res => spreadFields(res) as WriteResult )
		},
		update( id, data, params ) {
			if ( id ) {
				return axios.put( '', {
					records : [{
						id : id,
						fields : data
					}]
				} ).then( res => res.data.records )
				.then( res => spreadFields(res) as WriteResult )
			} else {
				return uglyPatchUpdate( 'put', params, data )
				.then( res => res.data.records )
				.then( res => spreadFields(res) as WriteResult )
			}
		},
		patch( id, data, params ) {
			if ( id ) {
				return axios.patch( '', {
					records : [{
						id : id,
						fields : data
					}]
				} )
				.then( res => res.data.records )
				.then( res => spreadFields(res) as WriteResult )
			} else {
				return uglyPatchUpdate( 'patch', params, data )
				.then( res => res.data.records )
				.then( res => spreadFields(res) as WriteResult )
			}
		},
		async remove( id, params ) {
			let arr : T[]
			if ( id ) {
				arr = [await this.get(id)]
			} else {
				arr = await this.find( params ).then( feathersResultToArray )
			}
			return axios.delete( '/', {
				params : {
					records : [...((params?.query as any)?.id?.$in ?? [id]), ...arr.map( a => a.id )]
				}
			} ).then( () => arr )
		}
	}

	return methods
}

export default service

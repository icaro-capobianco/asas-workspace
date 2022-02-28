import type { Application } from '@feathersjs/express'
import Axios from 'axios'
import { ServiceMethods } from '../service'

const MicroService = ( app : Application, service : string ) => {
    const client = Axios.create({
        baseURL: app.get('origin')
    })

    const methods : ServiceMethods = {
        get: (id, params) => client.get(`/${service}/${id}`, { params }),
        find: (params) => client.get(`/${service}`, { params }),
        create: (data, params) => client.post(`/${service}`, data, { params }),
        update: (id, data, params) => client.put(`/${service}/${id}`, data, { params }),
        patch: (id, data, params) => client.patch(`/${service}/${id}`, data, { params }),
        remove: (id, params) => client.delete(`/${service}/${id}`, { params })
    }

    return methods
}

export default MicroService


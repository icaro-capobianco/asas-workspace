import { Job } from 'node-schedule'
import { set } from 'lodash'

type Jobs = {
    [key: string]: Job
}

type JobMap = {
    [ID in string] : Jobs
}

export default () => {

    const jobMap : JobMap = {}

    const addJob = ( id : string, name : keyof Jobs, job : Job ) => {
        set( jobMap, `${id}.${name}`, job )
        job.once( 'run', () => removeJob( id, name ) )
    }
    const removeJob = ( id : string, name : keyof Jobs ) => {
        const jobs = jobMap[id]
        const job = jobs?.[name]
        if ( jobs && jobs[name] && job ) {
            job.cancel()
            delete jobs[name]
        }
    }
    return {
        jobMap,
        addJob,
        removeJob
    }
}

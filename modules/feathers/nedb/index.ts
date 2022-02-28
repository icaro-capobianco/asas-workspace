import NeDB from '@seald-io/nedb'
import service, { NedbServiceOptions } from 'feathers-nedb'

export default ( name : string, dir : string = 'data', options : Partial<NedbServiceOptions> ) => {
    return service({ Model: new NeDB({ filename: `./${dir}/${name}.db`, autoload: true }), options })
}

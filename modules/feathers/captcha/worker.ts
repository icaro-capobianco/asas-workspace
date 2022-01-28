import { work } from './crypto'

import '../../buffer'

const sw = self as unknown as ServiceWorkerGlobalScope & typeof globalThis

sw.Buffer = (sw as any).BrowserBuffer.Buffer

sw.addEventListener( 'message', (event) => {
    console.log(event)
    const { type, data } = event.data
    switch (type) {
        case 'work':
            const res = work( data.difficulty, data.prefix )
            sw.postMessage({type: 'response', from: 'work', data : res })
            break;
        default:
            break;
    }
} )

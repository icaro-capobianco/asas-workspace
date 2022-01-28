import { ComponentProps, useMemo } from 'react'
import { SwitchField } from './switch'
import { CheckboxField } from './checkbox'
import { InputField } from './input'
import { SliderField } from './slider'
import { NumberField } from './number'
import { TextareaField } from './textarea'
import { RadioField } from './radio'
import { SelectField } from './select'
import { chakra } from '@chakra-ui/react'
import { useFieldValue } from '../context'

const nullField = ( {} : any ) => <>Field Not Implemented</>

const MAP = {
    switch:     SwitchField,
    checkbox: CheckboxField,
    input:       InputField,
    number:     NumberField,
    textarea: TextareaField,
    radio:       RadioField,
    slider:     SliderField,
    select:     SelectField,
    datetime:     nullField,
    date:         nullField,
    time:         nullField
} as const

export function createField<T, >() {

    return <W extends keyof typeof MAP>( {
        field,
        label,
        component,
        ...props
    } : {
        field : keyof T,
        component : W
        label ?: string | (( value : any ) => string)
    } & Omit<ComponentProps<typeof MAP[W]>, 'component'> ) => {

        const Component = MAP[component]
        const value = useFieldValue(field as string)
        const labelStr = useMemo( () => {
            let res : string | false = false

            res = res || (typeof label === 'string' && label )

            res = res || (typeof label === 'function' && label(value))

            if ( typeof label === 'function' )
                console.log( value )

            return res || ''

        }, [label, value] )
        return (
            <chakra.label>
                {labelStr}
                <Component field={field} {...props as any} />
            </chakra.label>
        )
    }
}

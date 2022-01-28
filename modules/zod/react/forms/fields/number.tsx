import {
    NumberInput,
    NumberInputProps,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
  } from '@chakra-ui/react'
import { get } from 'lodash'
import { FC, useMemo } from 'react'
import { useContext } from '../context'

export const NumberField: FC<{
    field : string,
    stepper ?: boolean
} & NumberInputProps> = ({
    stepper,
    field,
    ...props
}) => {
    const { value : target, setProp } = useContext()
    const value = useMemo(() => get( target, field ), [target, field])
    return (
        <NumberInput value={value} onChange={(_s, v) => setProp( field, v )} {...props}>
            <NumberInputField />
            {stepper && (
                <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
            )}
        </NumberInput>
    )
}
import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"
const Forward10Icon = (props: SvgProps) => (
    <Svg
        width={36}
        height={36}
        fill="none"
        {...props}
    >
        <Path
            fill={props.color || "#fff"}
            d="M18 3C9.716 3 3 9.716 3 18c0 8.285 6.716 15 15 15 8.285 0 15-6.715 15-15h-3a12 12 0 1 1-2.797-7.703l-2.996 2.996A3.75 3.75 0 0 0 18 16.125v3.75a3.75 3.75 0 0 0 7.5 0v-3.75c0-1.021-.41-1.95-1.073-2.625H33v-9l-3.67 3.669A14.97 14.97 0 0 0 18 3Zm5.25 13.125v3.75a1.5 1.5 0 1 1-3 0v-3.75a1.5 1.5 0 0 1 3 0ZM15 12.75h-2.25v10.5H15v-10.5Z"
        />
    </Svg>
)
export default Forward10Icon

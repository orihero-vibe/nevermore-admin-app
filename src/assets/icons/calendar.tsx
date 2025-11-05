import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"
const CalendarIcon = (props: SvgProps) => (
  <Svg
    width={18}
    height={18}
    fill="none"
    {...props}
  >
    <Path
      stroke={props.color || "#fff"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M.75 6.75h16m-12 4h8m-4-7v-3m-5 3v-3m10 3v-3m-12 16h14a1 1 0 0 0 1-1v-12a1 1 0 0 0-1-1h-14a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"
    />
  </Svg>
)
export default CalendarIcon

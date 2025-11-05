import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"
const CalendarActiveIcon = (props: SvgProps) => (
  <Svg
    width={18}
    height={18}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#965CDF"}
      fillRule="evenodd"
      d="M3 2V1a1 1 0 0 1 2 0v1h3V1a1 1 0 0 1 2 0v1h3V1a1 1 0 0 1 2 0v1h1a2 2 0 0 1 2 2v2H0V4a2 2 0 0 1 2-2h1ZM0 16V8h18v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2Zm5-6a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2H5Z"
      clipRule="evenodd"
    />
  </Svg>
)
export default CalendarActiveIcon

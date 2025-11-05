import * as React from "react"
import Svg, { Path } from "react-native-svg"

const ChevronUpIcon = (props: any) => (
  <Svg
    width={16}
    height={16}
    fill="none"
    {...props}
  >
    <Path
      stroke={props.color || "#fff"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 10l4-4 4 4"
    />
  </Svg>
)

export default ChevronUpIcon


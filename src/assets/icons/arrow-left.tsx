import * as React from "react"
import Svg, { Path } from "react-native-svg"
const ArrowLeftIcon = (props: any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={14}
    fill="none"
    {...props}
  >
    <Path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M16.75 6.75h-16m0 0 6-6m-6 6 6 6"
    />
  </Svg>
)
export default ArrowLeftIcon

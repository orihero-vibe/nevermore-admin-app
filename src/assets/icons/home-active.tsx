import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"
const HomeIcon = (props: SvgProps) => (
  <Svg
    width={18}
    height={19}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#965CDF"}
      d="M10.45.53a2.25 2.25 0 0 0-2.9 0L.8 6.225a2.25 2.25 0 0 0-.8 1.72v9.305C0 18.215.784 19 1.75 19h3a1.75 1.75 0 0 0 1.75-1.75v-4.004c0-.68.542-1.232 1.217-1.25h2.566a1.25 1.25 0 0 1 1.217 1.25v4.004c0 .965.784 1.75 1.75 1.75h3A1.75 1.75 0 0 0 18 17.25V7.944a2.25 2.25 0 0 0-.8-1.72L10.45.53Z"
    />
  </Svg>
)
export default HomeIcon

import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

const EditIcon = ({ color = "#fff", width = 24, height = 24 }: SvgProps) => (
  <Svg
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 24 24"
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M14.074 3.885c.745-.807 1.117-1.21 1.513-1.446a3.106 3.106 0 0 1 3.103-.047c.403.224.787.616 1.555 1.4.768.785 1.152 1.178 1.37 1.589.529.992.512 2.194-.045 3.17-.23.404-.625.785-1.416 1.546l-9.403 9.057c-1.498 1.443-2.247 2.164-3.183 2.53-.936.365-1.965.338-4.023.285l-.28-.008c-.626-.016-.94-.024-1.121-.231-.183-.207-.158-.526-.108-1.164l.027-.346c.14-1.796.21-2.694.56-3.502.351-.807.956-1.463 2.166-2.774l9.285-10.059ZM13.541 4.541l6.06 6.06"
    />
  </Svg>
)

export default EditIcon
    
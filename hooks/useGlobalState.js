import { createGlobalState } from "react-hooks-global-state"

const initialState = {
    accountAddr: {},
    ipfsReference: {},
}
const { useGlobalState } = createGlobalState(initialState)

export default useGlobalState

import { atom } from "./atom";

const tradeAtom = atom({
  state: ({ operators, variables, set, get }) => {
    variables.socket = operators.connectToSocket("trade", set);
    return operators.getStoredValue();
  },
  actions: ({ set, get }) => {
    set: (value) => {
      operators.saveValueToStorage(value);
      return value
    },
    get: () => {
      return operators.getStoredValue();
    }
  },
  selectors: ({ set, get }) =>{
    commodity: (variables: number) => {
      const state = get()
      return state.securities?.at(0)?.commodity;
    }
  },
  reducers: ({ set, get }) => {
    revalidate: (url) => {
      operators.connectToSocket(url, set)
    }
  },
  variables: ({ operators, set, get }) => {
    placeholder: JSON.stringify({}),
    baseURL: "wss://garbage.com",
    socket: null
  },
  operators: ({ operators, variables, set, get }) => {
    getStoredValue: (): StoreType => {
      const { placeholder } = variables;
      const storedValue = localStorage.getItem("trade");
      return JSON.parse(storedValue ?? placeholder);
    },
    saveValueToStorage: (value) => {
      const stringifiedValue = JSON.stringify(value);
      localStorage.setItem("trade", stringifiedValue);
    },
    connectToSocket: (url, subscribe) => {
      if (variables.socket) {
        if (variables.socket.readyState === WebSocket.OPEN) {
          variables.socket.close();
        }
      }

      const socketURL = new URL(url, variables.baseURL);
      variables.socket =  new WebSocket(socketURL);
      variables.socket.on("message", (data) => {
        subscribe(data.message);
      })

      return () => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    }
  },
})

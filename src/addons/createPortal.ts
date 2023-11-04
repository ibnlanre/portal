import { createBuilder } from "component";
import { Builder, GetValueByPath, Paths } from "definition";

const store = {
  x: {
    y: 5,
  },
  z: {
    1: {
      a: "hello",
    },
  },
};

const builder = createBuilder(store, "lol", "ha");


function getValue<
  Store extends Record<string, any>,
  Path extends Paths<Builder<Store, any>>,
  Value extends GetValueByPath<Store, Path>
>(object: Store, path: Path) {
  let value = object
  const paths = path.split(".");
  for (const key of paths) value = value[key]
  return value as unknown as Value;
}

function usePortal<
  Store extends Record<string, any>,
  Path extends Paths<Builder<Store, any>>
>(builder: Builder<Store, any>, path: Path): GetValueByPath<Store, Path> {
  // /**
  //  * Retrieve the portal entry associated with the specified key or create a new one if not found.
  //  * @type {PortalEntry<S, A>}
  //  */
  // const subject = portal.getItem(pa, initialState, override);
  return 9 as any;
}

const portal = usePortal(builder, "z.1");

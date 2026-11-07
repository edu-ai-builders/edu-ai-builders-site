import "server-only";
import snapshot from "../../public/data/builder/index.json";
import discovery from "../../public/data/builder/discovery.json";
import type { BuilderResource, KeywordFamily } from "./builder-core";
export const builderCatalog = snapshot as unknown as {records:BuilderResource[];count:number;generated_at:string;note:string};
export const builderFamilies = discovery.families as KeywordFamily[];

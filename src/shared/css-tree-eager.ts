import * as csstree from "css-tree/dist/csstree.esm";
import { provideCssTree } from "./css-tree.ts";

// Pattern pages compile saved patterns while their modules evaluate, so they need
// the CSS parser at once. Import this module before any module that parses CSS.
provideCssTree(csstree);

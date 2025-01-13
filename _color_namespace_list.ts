import { colornames as colorNamespaceListCommunity } from "COLORNAMESPACELISTCOMMUNITY";
interface ColorNamespaceListEntry {
	hex: `#${string}`;
	name: string;
}
export const colorNamespaceList: Map<ColorNamespaceListEntry["name"], ColorNamespaceListEntry["hex"]> = new Map<ColorNamespaceListEntry["name"], ColorNamespaceListEntry["hex"]>();
for (const { name, hex } of (colorNamespaceListCommunity as ColorNamespaceListEntry[])) {
	colorNamespaceList.set(name, hex);
}

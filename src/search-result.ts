/**
 * An interface to save the result of a search on the tree.
 * found: true if value exists in tree
 * node: node which contains the value or node on the lowest layer which was searched
 * pageCount: number of nodes accessed during search
 */
interface SearchResult {
    found: boolean;
    node: TreeNode;
    pageCount: number;
}

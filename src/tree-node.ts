/**
 * A class to represent one node in the tree.
 */
class TreeNode {
    // Numeric values contained in this node.
    values: number[] = [];

    // Child nodes this node has a connection to.
    children: TreeNode[] = [];

    // This nodes parent node.
    parent: TreeNode;

    // Reference to the tree.
    tree: Tree;

    constructor(tree: Tree) {
        this.tree = tree;
    }

    /**
     * Returns the index of this node in the parents children array.
     */
    getIndexInParent(): number {
        return this.parent.children.indexOf(this);
    }

    /**
     * Returns true if this node is currently in an overflow state.
     */
    isOverflow(): boolean {
        return this.values.length > this.tree.getMaxElements();
    }

    /**
     * Returns true if this node is currently in an underflow state.
     */
    isUnderflow(): boolean {
        // The root can only be in an underflow state if there are no values left in the tree.
        if (!this.parent) {
            return this.values.length < 1;
        }

        return this.values.length < this.tree.getMinElements();
    }

    /**
     * Returns the node neighboring this node to the left (if possible).
     */
    getLeftNeighbor(): TreeNode {
        const index = this.getIndexInParent();

        // If this node is the leftmost node there can't be a neighbor.
        if (index <= 0) {
            return null;
        }

        return this.parent.children[index - 1];
    }

    /**
     * Returns the node neighboring this node to the right (if possible).
     */
    getRightNeighbor(): TreeNode {
        const index = this.getIndexInParent();

        // If this node is the rightmost node there can't be a neighbor.
        if (index >= this.parent.children.length) {
            return null;
        }

        return this.parent.children[index + 1];
    }

    /**
     * Helper function to determine if this node is a leaf node.
     */
    isLeaf() {
        return this.children && this.children.length === 0;
    }
}

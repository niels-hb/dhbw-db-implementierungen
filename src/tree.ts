class Tree {
    // Maximum number values one node can hold.
    maxElements: number;

    // The root node in this tree.
    root: TreeNode = new TreeNode(this);

    constructor(maxElements: number) {
        this.maxElements = maxElements;
    }

    /**
     * Helper function to determine the minimum number of elements one node can hold based on the formula.
     */
    getMinElements(): number {
        return Math.floor(this.maxElements / 2);
    }

    /**
     * This function will insert a value into the tree.
     */
    insert(value: number) {
        // Basic validation.
        if (value < 0 || !Number.isInteger(value)) {
            throw new Error(`Value "${value}" is not a positive integer (or zero).`);
        }

        const searchResult = this.search(value);

        // Prevent duplicates.
        if (searchResult.found) {
            throw new Error(`Value "${value}" added to tree already.`);
        }

        // Now the actual insert can be executed.
        this.insertInternal(searchResult.node, value);

        // If a split created a new root we need to update the reference.
        while (this.root.parent) {
            this.root = this.root.parent;
        }
    }

    private insertInternal(node: TreeNode, value: number) {
        // Find the index at which to insert the value.
        let index = 0;

        for (let i = 0; i <= node.values.length; i++) {
            index = i;

            // If the value is greater than the insert value we found the index and can stop.
            if (node.values[i] && node.values[i] > value) {
                break;
            }
        }

        // Insert the value into the node.
        node.values.splice(index, 0, value);

        // If the insert created an overflow we need to split the node.
        if (node.isOverflow()) {
            this.split(node);
        }
    }

    /**
     * This function will split the specified node to resolve an overflow.
     */
    split(node: TreeNode) {
        // Find the value in the "middle" of the node.
        let splitIndex = Math.floor((node.values.length) / 2);
        let splitValue = node.values[splitIndex];

        // Split the current values into to arrays. These will be the values of the new nodes.
        let newLeftValues = node.values.slice(0, splitIndex);
        let newRightValues = node.values.slice(splitIndex + 1);

        // If the node has no parent (i.e. is the root) we need to create a new root.
        // The initial child is the current node.
        if (!node.parent) {
            node.parent = new TreeNode(this);
            node.parent.children.push(node);
        }

        // Create a new node to the right of the current node.
        let treeNode = new TreeNode(this);
        treeNode.values = newRightValues;
        treeNode.parent = node.parent;

        // If the current node is not a leaf the children need to be split accordingly as well.
        if (!node.isLeaf()) {
            // Split the children for the left and right nodes.
            // (+1) because the children are offset by 1 in comparison to the values.
            const leftChildren = node.children.slice(0, splitIndex + 1);
            const rightChildren = node.children.slice(splitIndex + 1);

            // Adjustment: We need to set the new parent for the children moved to the other node.
            rightChildren.forEach((c) => c.parent = treeNode);

            // Add the left half of the children to the current node and the right half to the new right node.
            node.children = leftChildren;
            treeNode.children = rightChildren;
        }

        // Set the new values of the current node according to the split.
        node.values = newLeftValues;

        // Now add the newly created node to the right of the current node.
        node.parent.children.splice(node.getIndexInParent() + 1, 0, treeNode);

        // We need to insert the "middle" value from before in the parent.
        this.insertInternal(node.parent, splitValue);
    }

    /**
     * This function will delete a value from the tree.
     */
    delete(value: number) {
        let searchResult = this.search(value);

        // Basic validation.
        if (searchResult.found === false) {
            throw new Error(`Value "${value}" doesn\'t exist in tree.`);
        }

        // If the node containing the value is an inner node we need to find the switch node and value.
        if (!searchResult.node.isLeaf()) {
            // Find the index of the value which should be deleted.
            const deleteIndex = searchResult.node.values.indexOf(value);

            // The switch node will be to the left of this value.
            let switchNode = searchResult.node.children[deleteIndex];

            // Go down the subtree to the lower-rightmost leaf node.
            while (!switchNode.isLeaf()) {
                switchNode = switchNode.children[switchNode.children.length - 1];
            }

            // Replace the value in the node with the rightmost value in the leaf.
            searchResult.node.values[deleteIndex] = switchNode.values.pop();

            // Since we deleted from the leaf node we need to continue balancing with it.
            searchResult.node = switchNode;
        } else {
            // The node is a leaf, the value can therefore be directly removed.
            searchResult.node.values = searchResult.node.values.filter(e => e !== value);
        }

        // Possible underflow handling.
        this.balance(searchResult.node);
    }

    balance(node: TreeNode) {
        // If there isn't an underflow we can skip this. This can't be done in delete to allow recursion.
        if (!node.isUnderflow()) {
            return;
        }

        if (node.getLeftNeighbor() && node.getLeftNeighbor().values.length > this.getMinElements()) {
            // Option 1: The left neighbor can rotate a value without causing an underflow.

            // Find the left neighbor.
            const leftNeighbor = node.getLeftNeighbor();

            // Find the value in the parent which will be rotated to the current node.
            // -1 because the value is "left" of the child.
            const indexInParent = node.getIndexInParent() - 1;
            const parentValue = node.parent.values[indexInParent];

            // Remove the rightmost value from the left neighbor.
            const leftValue = leftNeighbor.values.pop();

            // If the left neighbor isn't a leaf we need to add the rightmost child of the left node as the leftmost child in the current node.
            // Update the parent reference since the node changed.
            if (!leftNeighbor.isLeaf()) {
                node.children.unshift(leftNeighbor.children.pop());
                node.children[0].parent = node;
            }

            // Add the value rotated from the parent as the leftmost value in the current node.
            node.values.unshift(parentValue);
            // Add the value rotated from the left neighbor at the position between left neighbor and current node in the parent.
            node.parent.values[indexInParent] = leftValue;
        } else if (node.getRightNeighbor() && node.getRightNeighbor().values.length > this.getMinElements()) {
            // Option 2: The right neighbor can rotate a value without causing an underflow.

            // Find the right neighbor.
            const rightNeighbor = node.getRightNeighbor();

            // Find the value in the parent which will be rotated to the current node.
            // No index offset necessary here.
            const indexInParent = node.getIndexInParent();
            const parentValue = node.parent.values[indexInParent];

            // Remove the leftmost value from the right neighbor.
            const rightValue = rightNeighbor.values.shift();

            // If the right neighbor isn't a leaf we need to add the leftmost child of the right node as the rightmost child in the current node.
            // Update the parent reference since the node changed.
            if (!rightNeighbor.isLeaf()) {
                node.children.push(rightNeighbor.children.shift());
                node.children[node.children.length - 1].parent = node;
            }

            // Add the value rotated from the parent as the rightmost value in the current node.
            node.values.push(parentValue);
            // Add the value rotated from the right neighbor at the position between left neighbor and current node in the parent.
            node.parent.values[indexInParent] = rightValue;
        } else {
            // Option 3: No neighbor can rotate a value without causing an underflow. We will merge with the left neighbor if possible or the right neighbor if not.

            // Find the left (or right) neighbor to merge with.
            let mergeNode = node.getLeftNeighbor();
            let isMergeToRight = false;
            if (!mergeNode) {
                mergeNode = node.getRightNeighbor();
                isMergeToRight = true;
            }

            // Find the value between the current node and the merge node in the parent.
            // If the left neighbor is used we need to correct the index by -1.
            // If the right neighbor is used we don't need to apply a correction.
            let indexInParent = node.getIndexInParent() - (isMergeToRight ? 0 : 1);
            let parentValue = node.parent.values[indexInParent];

            // We can set the parent for all children in the merge node to the current node already.
            mergeNode.children.forEach((c) => c.parent = node);

            if (!isMergeToRight) {
                // We want to merge the current node with the left neighbor.

                // Set the new values to: values of the left neighbor + value coming from parent + values of the current node.
                // filter is necessary because of a bug where undefined could be added to values.
                node.values = mergeNode.values.concat([parentValue]).concat(node.values).filter(e => Number.isInteger(e));

                // Set the new children to: children of the left neighbor + children of the current node.
                node.children = mergeNode.children.concat(node.children);
            } else {
                // We want to merge the current node with the right neighbor.

                // Set the new values to: values of the current node + value coming from parent + values of the right neighbor.
                // filter is necessary because of a bug where undefined could be added to values.
                node.values = node.values.concat([parentValue]).concat(mergeNode.values).filter(e => Number.isInteger(e));

                // Set the new children to: children of the current node + children of the right neighbor.
                node.children = node.children.concat(mergeNode.children);
            }

            // Remove the value between the merge node and the current node from the parent.
            node.parent.values.splice(indexInParent, 1);

            // Remove the merge node from the parents children.
            // If the left neighbor is used we don't need to apply a correction.
            // If the right neighbor is used we need to correct the index by +1.
            node.parent.children.splice(indexInParent + (isMergeToRight ? 1 : 0), 1);

            // If the merge caused the root to be removed we need to set the current node as the new root.
            if (node.parent == this.root && node.parent.values.length === 0) {
                node.parent = undefined;
                this.root = node;
            }
        }

        // Until we reached the root we need to propagate the balance operation.
        if (node.parent) {
            this.balance(node.parent);
        }
    }

    /**
     * This function will search value in the tree and return a SearchResult object.
     */
    search(value: number): SearchResult {
        // Begin the search at the root.
        let node = this.root;
        let pageCount = 0;
        let found = false;

        do {
            // We accessed a node, so pageCount needs to be incremented.
            pageCount++;

            // Have we found the value?
            found = node.values.includes(value);

            // If the value wasn't found and we still have children to search, search them.
            if (!found && !node.isLeaf()) {
                if (node.values[node.values.length - 1] < value) {
                    // If the last value is less than the search value we instantly know which child node to continue with.
                    node = node.children[node.children.length - 1];
                } else {
                    // Othwerwise we loop through all values until we find the correct child node to continue with.
                    for (let i = 0; i < node.values.length; i++) {
                        let childValue = node.values[i];

                        if (childValue > value) {
                            node = node.children[i];
                            break;
                        }
                    }
                }
            } else {
                break;
            }
        } while (true);

        return {
            node,
            found,
            pageCount
        };
    }
}
